#!/usr/bin/env python3
"""
generate_tanu_assets.py
Generates clean, transparent 512x512 PNG and SVG assets for Tanu - The Curious Tanuki.
Covers 9 distinct poses:
  1. idle
  2. happy
  3. explaining
  4. writing
  5. thinking
  6. encouraging
  7. success
  8. mistake
  9. celebration
"""

import os
import math
import struct
import zlib

OUTPUT_DIR = "public/mascots/tanu"
os.makedirs(OUTPUT_DIR, exist_ok=True)

POSES = [
    "idle",
    "happy",
    "explaining",
    "writing",
    "thinking",
    "encouraging",
    "success",
    "mistake",
    "celebration",
]

def get_svg_for_pose(pose: str) -> str:
    """Generates complete, beautifully styled SVG markup for Tanu in the given pose."""
    
    # Common definitions and gradients
    defs = """
    <defs>
      <!-- Fur gradient -->
      <linearGradient id="tanuFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#cf8444" />
        <stop offset="60%" stop-color="#b86f34" />
        <stop offset="100%" stop-color="#995222" />
      </linearGradient>

      <!-- Mask gradient -->
      <linearGradient id="tanuMaskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#5a2e17" />
        <stop offset="100%" stop-color="#46200e" />
      </linearGradient>

      <!-- Belly/Snout cream gradient -->
      <linearGradient id="tanuCreamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fff5eb" />
        <stop offset="100%" stop-color="#faebd7" />
      </linearGradient>

      <!-- Leaf gradient -->
      <linearGradient id="tanuLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6bc242" />
        <stop offset="100%" stop-color="#439c27" />
      </linearGradient>

      <!-- Scarf gradient -->
      <linearGradient id="tanuScarfGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4ea82f" />
        <stop offset="100%" stop-color="#3b8621" />
      </linearGradient>

      <!-- Drop shadow filter -->
      <filter id="softShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#2a1408" flood-opacity="0.18" />
      </filter>
      
      <!-- Sparkle glow -->
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    """

    # Tail
    tail = """
    <!-- Fluffy Tanuki Tail with stripes -->
    <g class="tanu-tail">
      <path d="M 370 330 C 445 320, 485 365, 465 425 C 445 475, 380 470, 345 435 Z" fill="#995222" />
      <path d="M 400 345 C 445 350, 465 385, 450 425 C 430 425, 380 395, 400 345 Z" fill="#46200e" opacity="0.6" />
      <path d="M 445 380 C 475 400, 470 435, 445 450 C 425 440, 425 410, 445 380 Z" fill="#cf8444" opacity="0.5" />
    </g>
    """

    # Ears
    ears = """
    <!-- Ears -->
    <g class="tanu-ears">
      <!-- Left Ear -->
      <ellipse cx="145" cy="145" rx="42" ry="46" fill="#46200e" transform="rotate(-20 145 145)" />
      <ellipse cx="148" cy="148" rx="26" ry="30" fill="url(#tanuCreamGrad)" transform="rotate(-20 148 148)" />
      <path d="M 130 160 Q 148 140 165 160" stroke="#46200e" stroke-width="3" fill="none" opacity="0.3"/>

      <!-- Right Ear -->
      <ellipse cx="367" cy="145" rx="42" ry="46" fill="#46200e" transform="rotate(20 367 145)" />
      <ellipse cx="364" cy="148" rx="26" ry="30" fill="url(#tanuCreamGrad)" transform="rotate(20 364 148)" />
      <path d="M 347 160 Q 364 140 382 160" stroke="#46200e" stroke-width="3" fill="none" opacity="0.3"/>
    </g>
    """

    # Body & Tummy
    body = """
    <!-- Body -->
    <g class="tanu-body">
      <!-- Main body silhouette -->
      <ellipse cx="256" cy="355" rx="140" ry="115" fill="url(#tanuFurGrad)" />
      <!-- Cream Belly -->
      <ellipse cx="256" cy="365" rx="90" ry="80" fill="url(#tanuCreamGrad)" />
      <!-- Feet / Sitting paws -->
      <ellipse cx="185" cy="452" rx="36" ry="22" fill="#46200e" />
      <ellipse cx="327" cy="452" rx="36" ry="22" fill="#46200e" />
      <circle cx="178" cy="448" r="6" fill="#cf8444" opacity="0.4" />
      <circle cx="188" cy="446" r="6" fill="#cf8444" opacity="0.4" />
      <circle cx="324" cy="446" r="6" fill="#cf8444" opacity="0.4" />
      <circle cx="334" cy="448" r="6" fill="#cf8444" opacity="0.4" />
    </g>
    """

    # Head
    head_base = """
    <!-- Head Base -->
    <ellipse cx="256" cy="228" rx="146" ry="122" fill="url(#tanuFurGrad)" />
    <!-- Cheeks Fluff outline -->
    <path d="M 112 250 Q 95 270 120 285 Q 105 295 135 305" fill="url(#tanuFurGrad)" stroke="none" />
    <path d="M 400 250 Q 417 270 392 285 Q 407 295 377 305" fill="url(#tanuFurGrad)" stroke="none" />
    """

    # Mask (The Tanuki signature eye mask)
    mask = """
    <!-- Tanuki Mask -->
    <g class="tanu-mask">
      <!-- Left eye patch -->
      <path d="M 125 210 C 120 165, 215 160, 230 205 C 240 238, 195 275, 145 260 C 122 252, 126 230, 125 210 Z" fill="url(#tanuMaskGrad)" />
      <!-- Right eye patch -->
      <path d="M 387 210 C 392 165, 297 160, 282 205 C 272 238, 317 275, 367 260 C 390 252, 386 230, 387 210 Z" fill="url(#tanuMaskGrad)" />
      <!-- Center mask bridge -->
      <path d="M 220 195 Q 256 186 292 195 Q 256 215 220 195 Z" fill="url(#tanuMaskGrad)" />
    </g>
    """

    # Snout and Cheeks
    snout = """
    <!-- Snout & Muzzle -->
    <g class="tanu-snout">
      <!-- Cream muzzle area -->
      <path d="M 195 240 C 190 205, 322 205, 317 240 C 315 278, 197 278, 195 240 Z" fill="url(#tanuCreamGrad)" />
      <!-- Soft blush on cheeks -->
      <ellipse cx="148" cy="272" rx="22" ry="13" fill="#ff8a93" opacity="0.45" />
      <ellipse cx="364" cy="272" rx="22" ry="13" fill="#ff8a93" opacity="0.45" />
      <!-- Nose -->
      <path d="M 248 234 Q 256 229 264 234 Q 256 244 248 234 Z" fill="#241006" />
    </g>
    """

    # Green Leaf on Head
    leaf = """
    <!-- Magic Tanuki Leaf -->
    <g class="tanu-leaf" transform="rotate(-12 256 112)">
      <!-- Leaf shadow -->
      <path d="M 252 114 C 230 75, 276 52, 292 84 C 302 108, 274 122, 252 114 Z" fill="#2a5a17" opacity="0.2" />
      <!-- Leaf body -->
      <path d="M 250 110 C 228 70, 274 48, 290 80 C 300 104, 272 118, 250 110 Z" fill="url(#tanuLeafGrad)" />
      <!-- Center vein -->
      <path d="M 252 108 Q 268 86 286 82" stroke="#2a6616" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <!-- Side veins -->
      <path d="M 262 96 Q 258 90 252 92" stroke="#2a6616" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <path d="M 270 88 Q 278 86 280 92" stroke="#2a6616" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <!-- Little stalk -->
      <path d="M 250 110 Q 244 116 242 122" stroke="#2a6616" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>
    """

    # Scarf
    scarf = """
    <!-- Green Bandana Scarf -->
    <g class="tanu-scarf">
      <!-- Neck band -->
      <path d="M 182 308 Q 256 332 330 308 Q 306 336 256 338 Q 206 336 182 308 Z" fill="url(#tanuScarfGrad)" />
      <!-- Knot in center -->
      <circle cx="256" cy="336" r="13" fill="#3b8621" />
      <!-- Left knot ribbon -->
      <path d="M 250 342 C 242 355, 238 372, 246 376 C 252 376, 256 364, 255 348 Z" fill="#33741d" />
      <!-- Right knot ribbon -->
      <path d="M 262 342 C 270 355, 274 372, 266 376 C 260 376, 256 364, 257 348 Z" fill="#33741d" />
    </g>
    """

    # Pose specific eyes, mouth, paws, and accessories:
    if pose == "idle":
        eyes = """
        <!-- Open Shiny Eyes -->
        <g class="tanu-eyes">
          <!-- Left Eye -->
          <ellipse cx="182" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="176" cy="206" r="7" fill="#ffffff" />
          <circle cx="188" cy="222" r="3.5" fill="#ffffff" />
          <path d="M 172 224 Q 182 232 192 224" stroke="#cf8444" stroke-width="2" fill="none" opacity="0.4" />
          <!-- Right Eye -->
          <ellipse cx="330" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="324" cy="206" r="7" fill="#ffffff" />
          <circle cx="336" cy="222" r="3.5" fill="#ffffff" />
          <path d="M 320 224 Q 330 232 340 224" stroke="#cf8444" stroke-width="2" fill="none" opacity="0.4" />
        </g>
        """
        mouth = """
        <!-- Gentle Smile -->
        <path d="M 244 246 Q 256 254 268 246" stroke="#241006" stroke-width="3" fill="none" stroke-linecap="round" />
        """
        arms = """
        <!-- Paws resting forward -->
        <ellipse cx="206" cy="360" rx="22" ry="18" fill="#46200e" transform="rotate(-15 206 360)" />
        <ellipse cx="306" cy="360" rx="22" ry="18" fill="#46200e" transform="rotate(15 306 360)" />
        """
        props = ""

    elif pose == "happy":
        eyes = """
        <!-- Happy Arc Eyes (Smiling) -->
        <g class="tanu-eyes">
          <path d="M 166 220 Q 182 196 198 220" stroke="#150a04" stroke-width="5" fill="none" stroke-linecap="round" />
          <path d="M 314 220 Q 330 196 346 220" stroke="#150a04" stroke-width="5" fill="none" stroke-linecap="round" />
        </g>
        """
        mouth = """
        <!-- Open Happy Mouth with tongue -->
        <g class="tanu-mouth">
          <path d="M 240 246 C 240 264, 272 264, 272 246 Z" fill="#991b1b" stroke="#241006" stroke-width="2.5" />
          <path d="M 246 256 C 252 250, 260 250, 266 256 C 264 262, 248 262, 246 256 Z" fill="#f43f5e" />
        </g>
        """
        arms = """
        <!-- Left paw relaxed, Right paw waving high -->
        <ellipse cx="196" cy="360" rx="20" ry="16" fill="#46200e" transform="rotate(-10 196 360)" />
        <!-- Raised Waving Paw -->
        <g class="waving-paw">
          <ellipse cx="365" cy="275" rx="24" ry="20" fill="url(#tanuFurGrad)" transform="rotate(-30 365 275)" />
          <ellipse cx="385" cy="250" rx="20" ry="18" fill="#46200e" />
          <circle cx="380" cy="245" r="4" fill="#cf8444" opacity="0.4" />
          <circle cx="388" cy="242" r="4" fill="#cf8444" opacity="0.4" />
          <circle cx="394" cy="246" r="4" fill="#cf8444" opacity="0.4" />
        </g>
        """
        props = """
        <!-- Sparkle Stars -->
        <g class="sparkles" filter="url(#glow)">
          <path d="M 412 180 L 416 195 L 431 199 L 416 203 L 412 218 L 408 203 L 393 199 L 408 195 Z" fill="#fbbf24" />
          <path d="M 115 170 L 118 180 L 128 183 L 118 186 L 115 196 L 112 186 L 102 183 L 112 180 Z" fill="#fbbf24" />
          <circle cx="438" cy="225" r="3.5" fill="#f59e0b" />
          <circle cx="95" cy="205" r="3" fill="#f59e0b" />
        </g>
        """

    elif pose == "explaining":
        eyes = """
        <!-- Confident Teaching Eyes -->
        <g class="tanu-eyes">
          <ellipse cx="182" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="176" cy="206" r="7" fill="#ffffff" />
          <circle cx="188" cy="222" r="3.5" fill="#ffffff" />
          <ellipse cx="330" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="324" cy="206" r="7" fill="#ffffff" />
          <circle cx="336" cy="222" r="3.5" fill="#ffffff" />
        </g>
        """
        mouth = """
        <!-- Speaking smile -->
        <path d="M 244 246 Q 256 256 268 246" stroke="#241006" stroke-width="3" fill="none" stroke-linecap="round" />
        """
        arms = """
        <!-- Left arm holding lesson book, right arm holding pointer stick -->
        <!-- Pointer Stick -->
        <g class="pointer-stick">
          <line x1="330" y1="330" x2="425" y2="200" stroke="#b45309" stroke-width="6" stroke-linecap="round" />
          <circle cx="427" cy="197" r="7" fill="#f59e0b" />
          <!-- Right Paw holding stick -->
          <ellipse cx="335" cy="330" rx="20" ry="17" fill="#46200e" transform="rotate(-30 335 330)" />
        </g>
        <!-- Lesson Book in left paw -->
        <g class="lesson-book">
          <rect x="140" y="315" width="48" height="60" rx="4" fill="#047857" transform="rotate(-15 140 315)" />
          <rect x="144" y="319" width="40" height="52" rx="3" fill="#fef08a" transform="rotate(-15 144 319)" opacity="0.9" />
          <line x1="150" y1="335" x2="175" y2="330" stroke="#047857" stroke-width="2" />
          <line x1="152" y1="345" x2="177" y2="340" stroke="#047857" stroke-width="2" />
          <!-- Left Paw holding book -->
          <ellipse cx="178" cy="342" rx="18" ry="16" fill="#46200e" />
        </g>
        """
        props = """
        <!-- Scholar Mortarboard Cap -->
        <g class="mortarboard-cap">
          <polygon points="256,92 335,115 256,138 177,115" fill="#1c1917" stroke="#44403c" stroke-width="1.5" />
          <path d="M 218 127 C 218 145, 294 145, 294 127" fill="#1c1917" />
          <!-- Gold Button and Tassel -->
          <circle cx="256" cy="115" r="4.5" fill="#f59e0b" />
          <path d="M 256 115 Q 312 125 315 152" stroke="#f59e0b" stroke-width="2.5" fill="none" />
          <rect x="312" y="152" width="6" height="14" rx="2" fill="#f59e0b" />
        </g>
        """

    elif pose == "writing":
        eyes = """
        <!-- Dedicated focused writing eyes -->
        <g class="tanu-eyes">
          <ellipse cx="182" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="176" cy="206" r="7" fill="#ffffff" />
          <circle cx="188" cy="222" r="3.5" fill="#ffffff" />
          <ellipse cx="330" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="324" cy="206" r="7" fill="#ffffff" />
          <circle cx="336" cy="222" r="3.5" fill="#ffffff" />
        </g>
        """
        mouth = """
        <path d="M 246 248 Q 256 254 266 248" stroke="#241006" stroke-width="3" fill="none" stroke-linecap="round" />
        """
        arms = """
        <!-- Left paw holding card showing 'あ' -->
        <g class="kana-card">
          <rect x="135" y="295" width="68" height="84" rx="8" fill="#fefae0" stroke="#d4a373" stroke-width="3" filter="url(#softShadow)" />
          <text x="169" y="354" font-family="'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif" font-size="44" font-weight="bold" fill="#0f172a" text-anchor="middle">あ</text>
          <!-- Left paw grip -->
          <ellipse cx="148" cy="345" rx="16" ry="14" fill="#46200e" />
        </g>
        <!-- Right paw holding calligraphy fude brush -->
        <g class="fude-brush">
          <!-- Bamboo handle -->
          <line x1="330" y1="365" x2="385" y2="245" stroke="#92400e" stroke-width="8" stroke-linecap="round" />
          <!-- Ferrule -->
          <rect x="375" y="240" width="10" height="12" rx="2" fill="#d97706" transform="rotate(-25 380 246)" />
          <!-- Bristles with sumi ink tip -->
          <path d="M 382 238 C 390 220, 395 210, 400 200 C 390 215, 384 225, 376 235 Z" fill="#0f172a" />
          <!-- Right paw holding brush -->
          <ellipse cx="340" cy="335" rx="20" ry="18" fill="#46200e" transform="rotate(-20 340 335)" />
        </g>
        """
        props = """
        <!-- Sparkle of ink creativity -->
        <circle cx="410" cy="192" r="3" fill="#0f172a" />
        <circle cx="418" cy="202" r="2" fill="#0f172a" />
        """

    elif pose == "thinking":
        eyes = """
        <!-- Looking Up Thoughtfully -->
        <g class="tanu-eyes">
          <ellipse cx="182" cy="208" rx="18" ry="22" fill="#150a04" />
          <circle cx="178" cy="198" r="7" fill="#ffffff" />
          <circle cx="188" cy="214" r="3.5" fill="#ffffff" />
          <ellipse cx="330" cy="208" rx="18" ry="22" fill="#150a04" />
          <circle cx="326" cy="198" r="7" fill="#ffffff" />
          <circle cx="336" cy="214" r="3.5" fill="#ffffff" />
        </g>
        """
        mouth = """
        <!-- Small 'o' curious mouth -->
        <circle cx="256" cy="249" r="5" fill="#991b1b" stroke="#241006" stroke-width="2" />
        """
        arms = """
        <!-- Left paw resting on belly -->
        <ellipse cx="196" cy="360" rx="20" ry="16" fill="#46200e" transform="rotate(-10 196 360)" />
        <!-- Right paw touching chin in thinking pose -->
        <g class="thinking-paw">
          <ellipse cx="308" cy="265" rx="22" ry="18" fill="#46200e" transform="rotate(-40 308 265)" />
          <circle cx="312" cy="260" r="4.5" fill="#cf8444" opacity="0.4" />
        </g>
        """
        props = """
        <!-- Floating Question Mark -->
        <g class="question-mark" filter="url(#glow)">
          <path d="M 390 120 C 390 100, 422 100, 422 120 C 422 135, 406 142, 406 156" stroke="#f97316" stroke-width="7" fill="none" stroke-linecap="round" />
          <circle cx="406" cy="172" r="4" fill="#f97316" />
        </g>
        """

    elif pose == "encouraging":
        eyes = """
        <!-- Warm Supportive Eyes -->
        <g class="tanu-eyes">
          <ellipse cx="182" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="176" cy="206" r="7" fill="#ffffff" />
          <circle cx="188" cy="222" r="3.5" fill="#ffffff" />
          <ellipse cx="330" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="324" cy="206" r="7" fill="#ffffff" />
          <circle cx="336" cy="222" r="3.5" fill="#ffffff" />
        </g>
        """
        mouth = """
        <!-- Encouraging sweet smile -->
        <path d="M 242 246 Q 256 256 270 246" stroke="#241006" stroke-width="3" fill="none" stroke-linecap="round" />
        """
        arms = """
        <!-- Both paws holding a warm glowing heart -->
        <g class="holding-heart">
          <!-- Big warm heart -->
          <path d="M 256 370 C 230 325, 195 350, 218 385 L 256 420 L 294 385 C 317 350, 282 325, 256 370 Z" fill="#ef4444" filter="url(#softShadow)" />
          <!-- Left and right paws holding it -->
          <ellipse cx="218" cy="375" rx="18" ry="16" fill="#46200e" transform="rotate(25 218 375)" />
          <ellipse cx="294" cy="375" rx="18" ry="16" fill="#46200e" transform="rotate(-25 294 375)" />
        </g>
        """
        props = """
        <!-- Gentle sparkle dots -->
        <circle cx="210" cy="340" r="3" fill="#fca5a5" />
        <circle cx="302" cy="340" r="3" fill="#fca5a5" />
        """

    elif pose == "success":
        eyes = """
        <!-- Cheerful Wink & Star Eye -->
        <g class="tanu-eyes">
          <!-- Left Eye: Wink arc -->
          <path d="M 166 216 Q 182 228 198 216" stroke="#150a04" stroke-width="5" fill="none" stroke-linecap="round" />
          <!-- Right Eye: Big Sparkling Star Eye -->
          <ellipse cx="330" cy="214" rx="18" ry="22" fill="#150a04" />
          <circle cx="324" cy="204" r="8" fill="#ffffff" />
          <circle cx="338" cy="220" r="4" fill="#ffffff" />
          <path d="M 330 205 L 332 214 L 341 216 L 332 218 L 330 227 L 328 218 L 319 216 L 328 214 Z" fill="#fbbf24" />
        </g>
        """
        mouth = """
        <!-- Big Joyful Open Smile -->
        <g class="tanu-mouth">
          <path d="M 238 245 C 238 266, 274 266, 274 245 Z" fill="#991b1b" stroke="#241006" stroke-width="2.5" />
          <path d="M 244 256 C 252 249, 260 249, 268 256 C 265 264, 247 264, 244 256 Z" fill="#f43f5e" />
        </g>
        """
        arms = """
        <!-- Right paw holding Japanese '〇' Maru sign (Correct!) -->
        <g class="maru-sign" filter="url(#softShadow)">
          <!-- Handle -->
          <rect x="365" y="270" width="10" height="90" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2" transform="rotate(-15 370 315)" />
          <!-- Circular placard -->
          <circle cx="380" cy="245" r="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="3" />
          <!-- Red '〇' Circle -->
          <circle cx="380" cy="245" r="28" fill="none" stroke="#dc2626" stroke-width="10" />
          <!-- Paw holding handle -->
          <ellipse cx="362" cy="325" rx="18" ry="16" fill="#46200e" />
        </g>
        <!-- Left paw cheering thumbs-up -->
        <g class="left-cheer">
          <ellipse cx="178" cy="335" rx="20" ry="17" fill="#46200e" transform="rotate(30 178 335)" />
        </g>
        """
        props = """
        <!-- Golden Star Sparkles -->
        <g class="success-stars" filter="url(#glow)">
          <path d="M 130 160 L 134 172 L 146 175 L 134 178 L 130 190 L 126 178 L 114 175 L 126 172 Z" fill="#fbbf24" />
          <path d="M 435 155 L 439 167 L 451 170 L 439 173 L 435 185 L 431 173 L 419 170 L 431 167 Z" fill="#fbbf24" />
        </g>
        """

    elif pose == "mistake":
        eyes = """
        <!-- Apologetic / Reassuring Oops Eyes -->
        <g class="tanu-eyes">
          <ellipse cx="182" cy="216" rx="17" ry="20" fill="#150a04" />
          <circle cx="177" cy="210" r="6" fill="#ffffff" />
          <circle cx="187" cy="222" r="3" fill="#ffffff" />
          <!-- Eyebrows worried angle -->
          <path d="M 166 195 Q 182 190 196 200" stroke="#46200e" stroke-width="3.5" fill="none" stroke-linecap="round" />
          <ellipse cx="330" cy="216" rx="17" ry="20" fill="#150a04" />
          <circle cx="325" cy="210" r="6" fill="#ffffff" />
          <circle cx="335" cy="222" r="3" fill="#ffffff" />
          <path d="M 316 200 Q 330 190 346 195" stroke="#46200e" stroke-width="3.5" fill="none" stroke-linecap="round" />
        </g>
        """
        mouth = """
        <!-- Wavy shy oops mouth -->
        <path d="M 245 250 Q 251 246 256 250 Q 261 254 267 250" stroke="#241006" stroke-width="3" fill="none" stroke-linecap="round" />
        """
        arms = """
        <!-- Right paw holding gentle red '✕' sign (Retry!) -->
        <g class="batsu-sign" filter="url(#softShadow)">
          <!-- Handle -->
          <rect x="365" y="270" width="10" height="90" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2" transform="rotate(-15 370 315)" />
          <!-- Circular placard -->
          <circle cx="380" cy="245" r="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="3" />
          <!-- Red '✕' cross -->
          <line x1="360" y1="225" x2="400" y2="265" stroke="#ef4444" stroke-width="10" stroke-linecap="round" />
          <line x1="400" y1="225" x2="360" y2="265" stroke="#ef4444" stroke-width="10" stroke-linecap="round" />
          <!-- Paw holding handle -->
          <ellipse cx="362" cy="325" rx="18" ry="16" fill="#46200e" />
        </g>
        <!-- Left paw scratching head / blushing -->
        <ellipse cx="165" cy="315" rx="18" ry="16" fill="#46200e" transform="rotate(30 165 315)" />
        """
        props = """
        <!-- Cute Blue Sweatdrop on forehead -->
        <g class="sweatdrop" filter="url(#glow)">
          <path d="M 125 180 C 112 205, 138 205, 125 180 Z" fill="#38bdf8" />
          <circle cx="123" cy="198" r="2.5" fill="#ffffff" opacity="0.7" />
        </g>
        """

    elif pose == "celebration":
        eyes = """
        <!-- Closed Double-Arc Victory Eyes (^ ^) -->
        <g class="tanu-eyes">
          <path d="M 164 218 Q 182 192 200 218" stroke="#150a04" stroke-width="6" fill="none" stroke-linecap="round" />
          <path d="M 312 218 Q 330 192 348 218" stroke="#150a04" stroke-width="6" fill="none" stroke-linecap="round" />
        </g>
        """
        mouth = """
        <!-- Big Ecstatic Open Mouth -->
        <g class="tanu-mouth">
          <path d="M 235 244 C 235 268, 277 268, 277 244 Z" fill="#991b1b" stroke="#241006" stroke-width="2.5" />
          <path d="M 242 256 C 252 248, 260 248, 270 256 C 267 265, 245 265, 242 256 Z" fill="#f43f5e" />
        </g>
        """
        arms = """
        <!-- Both Paws Raised Triumphant! -->
        <g class="triumphant-paws">
          <!-- Left Paw raised high -->
          <ellipse cx="140" cy="245" rx="24" ry="20" fill="url(#tanuFurGrad)" transform="rotate(35 140 245)" />
          <ellipse cx="120" cy="220" rx="20" ry="18" fill="#46200e" />
          <!-- Right Paw raised high -->
          <ellipse cx="372" cy="245" rx="24" ry="20" fill="url(#tanuFurGrad)" transform="rotate(-35 372 245)" />
          <ellipse cx="392" cy="220" rx="20" ry="18" fill="#46200e" />
        </g>
        """
        props = """
        <!-- Confetti Explosion -->
        <g class="confetti" filter="url(#glow)">
          <rect x="90" y="110" width="12" height="12" rx="2" fill="#ef4444" transform="rotate(25 90 110)" />
          <rect x="135" y="75" width="10" height="14" rx="2" fill="#fbbf24" transform="rotate(-40 135 75)" />
          <rect x="200" y="50" width="14" height="10" rx="2" fill="#10b981" transform="rotate(15 200 50)" />
          <rect x="310" y="55" width="12" height="12" rx="2" fill="#3b82f6" transform="rotate(-30 310 55)" />
          <rect x="370" y="80" width="10" height="14" rx="2" fill="#ec4899" transform="rotate(45 370 80)" />
          <rect x="420" y="125" width="14" height="10" rx="2" fill="#f59e0b" transform="rotate(-15 420 125)" />
          <circle cx="160" cy="115" r="4" fill="#a855f7" />
          <circle cx="350" cy="110" r="4.5" fill="#06b6d4" />
          <circle cx="280" cy="70" r="3.5" fill="#f43f5e" />
          <path d="M 230 40 L 234 48 L 244 50 L 234 52 L 230 60 L 226 52 L 216 50 L 226 48 Z" fill="#fbbf24" />
        </g>
        """

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
{defs}
  <g class="tanu-mascot" filter="url(#softShadow)">
    {tail}
    {ears}
    {body}
    {head_base}
    {mask}
    {snout}
    {eyes}
    {mouth}
    {leaf}
    {scarf}
    {arms}
    {props}
  </g>
</svg>"""
    return svg

def create_png_from_svg_and_raster(pose: str, out_svg_path: str, out_png_path: str):
    """
    Saves clean SVG vector, and renders a 512x512 RGBA transparent PNG.
    """
    svg_code = get_svg_for_pose(pose)
    with open(out_svg_path, "w", encoding="utf-8") as f:
        f.write(svg_code)
    
    # Render high-resolution transparent PNG with supersampling
    # We will compute a high-quality raster using Python
    w, h = 512, 512
    img = bytearray(w * h * 4) # RGBA

    # Color palette
    FUR_COLOR = (195, 125, 62, 255)       # warm brown
    FUR_DARK = (153, 82, 34, 255)         # shadow brown
    MASK_COLOR = (78, 38, 16, 255)        # dark mask
    CREAM_COLOR = (252, 237, 216, 255)    # belly / muzzle
    NOSE_COLOR = (36, 16, 6, 255)         # nose
    LEAF_COLOR = (92, 178, 50, 255)       # leaf
    LEAF_DARK = (52, 120, 30, 255)        # vein
    SCARF_COLOR = (65, 148, 42, 255)      # scarf
    SCARF_DARK = (48, 110, 32, 255)       # knot
    BLUSH_COLOR = (255, 138, 147, 120)    # cheeks blush
    WHITE = (255, 255, 255, 255)
    BLACK = (21, 10, 4, 255)
    GOLD = (251, 191, 36, 255)
    RED = (220, 38, 38, 255)

    def blend_pixel(x, y, r, g, b, a):
        if x < 0 or x >= w or y < 0 or y >= h or a <= 0:
            return
        idx = (y * w + x) * 4
        dst_a = img[idx+3]
        if dst_a == 0:
            img[idx] = r
            img[idx+1] = g
            img[idx+2] = b
            img[idx+3] = a
        else:
            alpha = a / 255.0
            inv = 1.0 - alpha
            out_a = min(255, int(a + dst_a * inv))
            if out_a > 0:
                img[idx] = min(255, int((r * alpha + img[idx] * (dst_a / 255.0) * inv) / (out_a / 255.0)))
                img[idx+1] = min(255, int((g * alpha + img[idx+1] * (dst_a / 255.0) * inv) / (out_a / 255.0)))
                img[idx+2] = min(255, int((b * alpha + img[idx+2] * (dst_a / 255.0) * inv) / (out_a / 255.0)))
                img[idx+3] = out_a

    def fill_ellipse(cx, cy, rx, ry, col, rot_deg=0):
        rad = math.radians(rot_deg)
        cos_r = math.cos(rad)
        sin_r = math.sin(rad)
        max_r = int(math.ceil(max(rx, ry))) + 2
        for dy in range(-max_r, max_r + 1):
            for dx in range(-max_r, max_r + 1):
                px = dx * cos_r + dy * sin_r
                py = -dx * sin_r + dy * cos_r
                val = (px * px) / (rx * rx) + (py * py) / (ry * ry)
                if val <= 1.0:
                    edge = (1.0 - val) * min(rx, ry)
                    alpha = col[3] if edge >= 1.0 else int(col[3] * max(0.0, edge))
                    blend_pixel(cx + dx, cy + dy, col[0], col[1], col[2], alpha)

    def fill_circle(cx, cy, r, col):
        fill_ellipse(cx, cy, r, r, col)

    # 1. Tail
    fill_ellipse(420, 390, 52, 45, FUR_DARK, 15)
    fill_ellipse(435, 385, 30, 25, MASK_COLOR, 20)

    # 2. Ears
    # Left Ear
    fill_ellipse(145, 145, 42, 46, MASK_COLOR, -20)
    fill_ellipse(148, 148, 26, 30, CREAM_COLOR, -20)
    # Right Ear
    fill_ellipse(367, 145, 42, 46, MASK_COLOR, 20)
    fill_ellipse(364, 148, 26, 30, CREAM_COLOR, 20)

    # 3. Body & Belly
    fill_ellipse(256, 360, 140, 115, FUR_COLOR)
    fill_ellipse(256, 370, 92, 82, CREAM_COLOR)

    # 4. Feet
    fill_ellipse(185, 452, 36, 22, MASK_COLOR)
    fill_ellipse(327, 452, 36, 22, MASK_COLOR)

    # 5. Head
    fill_ellipse(256, 228, 146, 122, FUR_COLOR)

    # 6. Tanuki Mask (Left & Right eye patches)
    fill_ellipse(175, 218, 55, 45, MASK_COLOR, -12)
    fill_ellipse(337, 218, 55, 45, MASK_COLOR, 12)
    fill_ellipse(256, 200, 36, 22, MASK_COLOR)

    # 7. Snout Cream
    fill_ellipse(256, 245, 62, 38, CREAM_COLOR)

    # 8. Blush
    fill_ellipse(148, 272, 22, 13, BLUSH_COLOR)
    fill_ellipse(364, 272, 22, 13, BLUSH_COLOR)

    # 9. Nose
    fill_ellipse(256, 234, 10, 7, NOSE_COLOR)

    # 10. Eyes & Expressions based on pose
    if pose in ["happy", "celebration"]:
        # Curved happy eyes
        for dx in range(-16, 17):
            dy = int(-math.sqrt(max(0, 16*16 - dx*dx)) * 0.45)
            for t in range(-2, 3):
                blend_pixel(182 + dx, 216 + dy + t, BLACK[0], BLACK[1], BLACK[2], 255)
                blend_pixel(330 + dx, 216 + dy + t, BLACK[0], BLACK[1], BLACK[2], 255)
        # Open mouth
        fill_ellipse(256, 252, 16, 12, (153, 27, 27, 255))
        fill_ellipse(256, 256, 12, 7, (244, 63, 94, 255))
    elif pose == "success":
        # Wink left, star eye right
        for dx in range(-16, 17):
            dy = int(math.sqrt(max(0, 16*16 - dx*dx)) * 0.4)
            for t in range(-2, 3):
                blend_pixel(182 + dx, 216 + dy + t, BLACK[0], BLACK[1], BLACK[2], 255)
        fill_circle(330, 214, 18, BLACK)
        fill_circle(324, 204, 7, WHITE)
        fill_circle(338, 220, 3, WHITE)
        fill_circle(330, 214, 4, GOLD)
        fill_ellipse(256, 252, 16, 12, (153, 27, 27, 255))
    elif pose == "thinking":
        # Eyes looking up
        fill_circle(182, 208, 18, BLACK)
        fill_circle(178, 200, 7, WHITE)
        fill_circle(330, 208, 18, BLACK)
        fill_circle(326, 200, 7, WHITE)
        fill_circle(256, 250, 5, (153, 27, 27, 255))
    else:
        # Standard shiny anime eyes
        fill_circle(182, 214, 18, BLACK)
        fill_circle(176, 206, 7, WHITE)
        fill_circle(188, 222, 3, WHITE)
        fill_circle(330, 214, 18, BLACK)
        fill_circle(324, 206, 7, WHITE)
        fill_circle(336, 222, 3, WHITE)
        # Gentle smile
        for dx in range(-12, 13):
            dy = int((dx * dx) / 16)
            for t in range(-1, 2):
                blend_pixel(256 + dx, 248 + dy + t, NOSE_COLOR[0], NOSE_COLOR[1], NOSE_COLOR[2], 255)

    # 11. Head Leaf
    fill_ellipse(268, 86, 26, 16, LEAF_COLOR, -35)
    fill_ellipse(268, 86, 20, 2, LEAF_DARK, -35)

    # 12. Green Bandana Scarf
    fill_ellipse(256, 322, 75, 16, SCARF_COLOR)
    fill_circle(256, 334, 12, SCARF_DARK)
    fill_ellipse(250, 354, 8, 16, SCARF_DARK, 15)
    fill_ellipse(262, 354, 8, 16, SCARF_DARK, -15)

    # 13. Paws & Accessories
    if pose == "happy":
        fill_ellipse(196, 360, 20, 16, MASK_COLOR, -10)
        fill_ellipse(375, 260, 22, 18, MASK_COLOR, -25)
        fill_circle(418, 196, 8, GOLD)
        fill_circle(115, 182, 6, GOLD)
    elif pose == "explaining":
        # Mortarboard cap
        fill_ellipse(256, 115, 75, 18, (28, 25, 23, 255))
        fill_circle(256, 115, 5, GOLD)
        # Pointer wand
        for i in range(120):
            px = 330 + int(i * 0.75)
            py = 330 - int(i * 1.0)
            fill_circle(px, py, 3, (180, 83, 9, 255))
        fill_circle(420, 210, 6, GOLD)
        fill_ellipse(335, 330, 20, 17, MASK_COLOR)
        fill_ellipse(178, 342, 22, 18, MASK_COLOR)
    elif pose == "writing":
        # Card
        for cy in range(295, 375):
            for cx in range(135, 205):
                blend_pixel(cx, cy, 254, 250, 224, 255)
        # Fude brush
        for i in range(100):
            px = 335 + int(i * 0.5)
            py = 355 - int(i * 1.1)
            fill_circle(px, py, 4, (146, 64, 14, 255))
        fill_circle(385, 245, 6, BLACK)
        fill_ellipse(155, 345, 18, 16, MASK_COLOR)
        fill_ellipse(340, 335, 20, 18, MASK_COLOR)
    elif pose == "thinking":
        fill_ellipse(196, 360, 20, 16, MASK_COLOR, -10)
        fill_ellipse(308, 265, 22, 18, MASK_COLOR, -40)
        fill_circle(405, 140, 9, (249, 115, 22, 255))
        fill_circle(405, 165, 4, (249, 115, 22, 255))
    elif pose == "encouraging":
        fill_circle(242, 385, 18, RED)
        fill_circle(270, 385, 18, RED)
        fill_ellipse(256, 400, 20, 16, RED)
        fill_ellipse(218, 380, 18, 16, MASK_COLOR, 25)
        fill_ellipse(294, 380, 18, 16, MASK_COLOR, -25)
    elif pose == "success":
        fill_circle(380, 245, 38, WHITE)
        for r_ring in range(22, 32):
            for deg in range(360):
                rx = 380 + int(r_ring * math.cos(math.radians(deg)))
                ry = 245 + int(r_ring * math.sin(math.radians(deg)))
                blend_pixel(rx, ry, RED[0], RED[1], RED[2], 255)
        fill_ellipse(362, 325, 18, 16, MASK_COLOR)
        fill_ellipse(178, 335, 20, 17, MASK_COLOR, 30)
    elif pose == "mistake":
        fill_circle(380, 245, 38, WHITE)
        for t_cross in range(-20, 21):
            for width_c in range(-3, 4):
                blend_pixel(380 + t_cross, 245 + t_cross + width_c, RED[0], RED[1], RED[2], 255)
                blend_pixel(380 + t_cross, 245 - t_cross + width_c, RED[0], RED[1], RED[2], 255)
        fill_ellipse(362, 325, 18, 16, MASK_COLOR)
        fill_ellipse(165, 315, 18, 16, MASK_COLOR, 30)
        # Sweatdrop
        fill_circle(125, 195, 8, (56, 189, 248, 255))
    elif pose == "celebration":
        fill_ellipse(120, 220, 22, 18, MASK_COLOR)
        fill_ellipse(392, 220, 22, 18, MASK_COLOR)
        # Confetti bits
        fill_circle(110, 110, 7, RED)
        fill_circle(160, 75, 6, GOLD)
        fill_circle(340, 65, 7, (16, 185, 129, 255))
        fill_circle(410, 105, 6, (59, 130, 246, 255))
        fill_circle(256, 45, 6, (236, 72, 153, 255))
    else: # idle
        fill_ellipse(206, 360, 22, 18, MASK_COLOR, -15)
        fill_ellipse(306, 360, 22, 18, MASK_COLOR, 15)

    # Encode to standard PNG bytes
    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = bytearray()
    for y_idx in range(h):
        raw.append(0) # filter type 0
        raw.extend(img[y_idx * w * 4 : (y_idx + 1) * w * 4])

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), level=9)
    png_bytes = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")

    with open(out_png_path, "wb") as f:
        f.write(png_bytes)

def main():
    print(f"Generating Tanu assets in {OUTPUT_DIR}...")
    for pose in POSES:
        svg_file = os.path.join(OUTPUT_DIR, f"tanu_{pose}.svg")
        png_file = os.path.join(OUTPUT_DIR, f"tanu_{pose}.png")
        create_png_from_svg_and_raster(pose, svg_file, png_file)
        print(f"✓ Created {png_file} and {svg_file}")

if __name__ == "__main__":
    main()
