"use client";

import "./../../../styles/legacy/components/animation/BanyanTree/BanyanTree.css";

export function BanyanTree() {
  return (
    <div className="banyan-tree">
      <svg
        viewBox="0 0 640 500"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Mature banyan tree with spreading roots, a wooden treehouse and a small bird nest"
      >
        <defs>
          {/* Bark */}
          <linearGradient id="bark-main" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#29190f" />
            <stop offset=".17" stopColor="#563722" />
            <stop offset=".36" stopColor="#98704a" />
            <stop offset=".5" stopColor="#bd9160" />
            <stop offset=".68" stopColor="#775033" />
            <stop offset=".86" stopColor="#49301e" />
            <stop offset="1" stopColor="#24170f" />
          </linearGradient>

          <linearGradient id="bark-root" x1="0" y1="0" x2=".8" y2="1">
            <stop stopColor="#b08456" />
            <stop offset=".45" stopColor="#79502f" />
            <stop offset="1" stopColor="#352117" />
          </linearGradient>

          <linearGradient id="bark-branch" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#946640" />
            <stop offset=".5" stopColor="#684329" />
            <stop offset="1" stopColor="#362218" />
          </linearGradient>

          {/* Leaves */}
          <radialGradient id="leaf-deep" cx="35%" cy="25%" r="80%">
            <stop stopColor="#78984c" />
            <stop offset=".45" stopColor="#416c35" />
            <stop offset="1" stopColor="#173a21" />
          </radialGradient>

          <radialGradient id="leaf-mid" cx="35%" cy="20%" r="85%">
            <stop stopColor="#a1b96b" />
            <stop offset=".45" stopColor="#648c43" />
            <stop offset="1" stopColor="#315b2d" />
          </radialGradient>

          <radialGradient id="leaf-dark" cx="35%" cy="20%" r="85%">
            <stop stopColor="#557b3b" />
            <stop offset=".6" stopColor="#315b2d" />
            <stop offset="1" stopColor="#17351f" />
          </radialGradient>

          {/* Treehouse */}
          <linearGradient id="house-wood" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#805637" />
            <stop offset=".5" stopColor="#614027" />
            <stop offset="1" stopColor="#392519" />
          </linearGradient>

          <linearGradient id="house-roof" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#805334" />
            <stop offset="1" stopColor="#352116" />
          </linearGradient>

          <linearGradient id="house-window">
            <stop stopColor="#fff2b7" />
            <stop offset="1" stopColor="#d18b3e" />
          </linearGradient>

          <filter id="tree-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse
          cx="320"
          cy="463"
          rx="215"
          ry="13"
          fill="#172719"
          opacity=".24"
          filter="url(#tree-shadow)"
        />

        {/* Main branches behind the leaves */}
        <g fill="none" stroke="url(#bark-branch)" strokeLinecap="round">
          <path
            d="M308 425 C289 337 291 258 253 170 C225 117 166 106 83 93"
            strokeWidth="39"
          />
          <path
            d="M324 391 C356 296 411 226 484 190 C527 166 568 151 610 151"
            strokeWidth="30"
          />
          <path d="M290 305 C235 258 180 246 121 241" strokeWidth="21" />
          <path d="M343 315 C397 280 451 278 510 296" strokeWidth="19" />
        </g>

        {/* Deep foliage behind the canopy */}
        <g fill="#153820">
          <ellipse cx="100" cy="148" rx="75" ry="68" />
          <ellipse cx="190" cy="91" rx="92" ry="74" />
          <ellipse cx="320" cy="78" rx="98" ry="76" />
          <ellipse cx="460" cy="105" rx="100" ry="75" />
          <ellipse cx="550" cy="159" rx="75" ry="68" />
          <ellipse cx="170" cy="210" rx="110" ry="67" />
          <ellipse cx="360" cy="215" rx="125" ry="72" />
          <ellipse cx="500" cy="215" rx="105" ry="65" />
        </g>

        {/* Natural irregular canopy clusters */}
        <g className="banyan-canopy">
          {/* Left upper foliage */}
          <g className="banyan-leaf-cluster cluster-one">
            <path
              d="M30 150
                 Q20 99 66 68
                 Q107 34 152 70
                 Q192 42 223 85
                 Q251 116 226 163
                 Q198 201 142 183
                 Q88 212 48 180Z"
              fill="url(#leaf-deep)"
            />

            <path
              d="M48 126 Q93 76 151 109 Q104 143 48 126Z"
              fill="#91aa5c"
              opacity=".55"
            />

            <path
              d="M71 157 Q123 127 173 159 Q119 186 71 157Z"
              fill="#254c28"
              opacity=".7"
            />

            <path
              d="M62 99 Q91 71 124 84"
              fill="none"
              stroke="#b0c477"
              strokeWidth="3"
              opacity=".25"
            />
          </g>

          {/* Center upper foliage */}
          <g className="banyan-leaf-cluster cluster-two">
            <path
              d="M130 98
                 Q126 43 180 22
                 Q234 -4 281 35
                 Q330 8 372 49
                 Q408 86 377 137
                 Q343 173 287 143
                 Q229 172 177 145
                 Q144 135 130 98Z"
              fill="url(#leaf-mid)"
            />

            <path
              d="M158 78 Q215 24 281 64 Q222 103 158 78Z"
              fill="#b0c77b"
              opacity=".48"
            />

            <path
              d="M183 121 Q248 83 312 119 Q250 155 183 121Z"
              fill="#315c2e"
              opacity=".6"
            />

            <path
              d="M202 45 Q244 20 273 40"
              fill="none"
              stroke="#d0dca0"
              strokeWidth="3"
              opacity=".2"
            />
          </g>

          {/* Right upper foliage */}
          <g className="banyan-leaf-cluster cluster-three">
            <path
              d="M330 89
                 Q327 42 379 27
                 Q431 5 469 40
                 Q522 15 561 62
                 Q604 99 578 148
                 Q553 188 495 162
                 Q441 190 390 154
                 Q346 137 330 89Z"
              fill="url(#leaf-deep)"
            />

            <path
              d="M361 75 Q421 27 489 67 Q430 105 361 75Z"
              fill="#92ad61"
              opacity=".5"
            />

            <path
              d="M390 123 Q453 88 518 124 Q453 158 390 123Z"
              fill="#244a27"
              opacity=".65"
            />
          </g>

          {/* Far-right lower foliage */}
          <g className="banyan-leaf-cluster cluster-four">
            <path
              d="M470 143
                 Q514 102 568 124
                 Q626 147 607 199
                 Q594 247 535 244
                 Q485 262 448 222
                 Q430 180 470 143Z"
              fill="url(#leaf-mid)"
            />

            <path
              d="M470 169 Q526 121 579 161 Q526 194 470 169Z"
              fill="#a1b96c"
              opacity=".48"
            />
          </g>

          {/* Lower left foliage */}
          <g className="banyan-leaf-cluster cluster-five">
            <path
              d="M40 177
                 Q65 139 118 151
                 Q165 131 207 165
                 Q244 195 217 236
                 Q185 274 132 251
                 Q75 269 45 229
                 Q25 204 40 177Z"
              fill="url(#leaf-dark)"
            />

            <path
              d="M59 194 Q112 157 171 192 Q111 225 59 194Z"
              fill="#799a4e"
              opacity=".45"
            />
          </g>

          {/* Lower center foliage */}
          <g className="banyan-leaf-cluster cluster-six">
            <path
              d="M191 159
                 Q238 121 287 153
                 Q336 119 384 155
                 Q426 191 396 235
                 Q364 274 310 249
                 Q258 279 211 245
                 Q169 216 191 159Z"
              fill="url(#leaf-deep)"
            />

            <path
              d="M211 183 Q274 143 336 181 Q273 217 211 183Z"
              fill="#8cae58"
              opacity=".45"
            />

            <path
              d="M245 225 Q303 194 361 225 Q300 257 245 225Z"
              fill="#234b28"
              opacity=".62"
            />
          </g>

          {/* Lower right foliage */}
          <g className="banyan-leaf-cluster cluster-seven">
            <path
              d="M367 165
                 Q411 128 462 151
                 Q513 129 552 170
                 Q580 205 548 244
                 Q510 276 462 250
                 Q413 271 380 236
                 Q347 207 367 165Z"
              fill="url(#leaf-dark)"
            />

            <path
              d="M383 183 Q443 145 501 182 Q443 217 383 183Z"
              fill="#799a4e"
              opacity=".45"
            />
          </g>
        </g>

        {/* Individual leaf highlights */}
        <g fill="none" stroke="#c0d18a" strokeLinecap="round" opacity=".32">
          <path d="M64 103 Q92 81 119 85" strokeWidth="2" />
          <path d="M173 62 Q208 35 243 49" strokeWidth="2" />
          <path d="M365 57 Q405 30 444 48" strokeWidth="2" />
          <path d="M494 157 Q531 134 563 151" strokeWidth="2" />
          <path d="M87 182 Q117 165 146 174" strokeWidth="2" />
          <path d="M241 173 Q275 153 310 164" strokeWidth="2" />
        </g>

        {/* Main trunk */}
        <path
          d="
    M270 450
    C253 425 255 400 267 375
    C280 345 266 320 251 290
    C238 265 252 245 280 235
    C305 225 329 245 336 275
    C347 310 329 340 339 375
    C349 405 365 430 355 450Z
  "
          fill="url(#bark-main)"
          stroke="#2b1b12"
          strokeWidth="5"
        />

        {/* Trunk ridges */}
        <g fill="none" strokeLinecap="round">
          <path
            d="M275 430 Q264 378 284 329 Q297 278 271 218"
            stroke="#d4a575"
            strokeWidth="4"
            opacity=".55"
          />

          <path
            d="M292 442 Q281 393 302 345 Q313 285 291 205"
            stroke="#e0b582"
            strokeWidth="2.5"
            opacity=".5"
          />

          <path
            d="M319 438 Q333 385 315 341 Q333 283 315 218"
            stroke="#382318"
            strokeWidth="5"
            opacity=".6"
          />

          <path
            d="M345 418 Q334 380 344 353"
            stroke="#d2a16b"
            strokeWidth="3"
            opacity=".4"
          />

          <path
            d="M260 345 Q275 331 287 339"
            stroke="#362116"
            strokeWidth="4"
            opacity=".55"
          />

          <path
            d="M281 252 Q300 237 318 250"
            stroke="#e2b783"
            strokeWidth="2"
            opacity=".3"
          />
        </g>

        {/* Banyan aerial roots */}
        <g
          className="banyan-aerial-roots"
          fill="none"
          stroke="url(#bark-main)"
          strokeLinecap="round"
        >
          <path d="M115 145 Q125 221 105 344" strokeWidth="8" />
          <path d="M143 158 Q151 241 137 378" strokeWidth="6" />
          <path d="M174 190 Q183 251 178 322" strokeWidth="4" />
          <path d="M471 144 Q463 229 476 337" strokeWidth="7" />
          <path d="M506 151 Q514 235 507 305" strokeWidth="5" />
          <path d="M432 176 Q428 231 435 290" strokeWidth="3.5" />
        </g>

        {/* Treehouse supporting branch */}
        <g fill="none" stroke="url(#bark-branch)" strokeLinecap="round">
          <path d="M245 290 Q318 248 409 285" strokeWidth="22" />
          <path d="M250 310 Q325 278 405 306" strokeWidth="13" />
        </g>

        {/* Treehouse - slightly smaller */}
        <g transform="translate(24 20) scale(.84)">
          {/* House body */}
          <path
            d="M270 230 H395 V330 H270Z"
            fill="url(#house-wood)"
            stroke="#2b1b12"
            strokeWidth="5"
          />

          {/* Planks */}
          <g stroke="#382419" strokeWidth="2" opacity=".8">
            <path d="M270 250 H395" />
            <path d="M270 270 H395" />
            <path d="M270 290 H395" />
            <path d="M270 310 H395" />
          </g>

          {/* Roof */}
          <path
            d="M245 235 L325 175 L420 235Z"
            fill="url(#house-roof)"
            stroke="#28180f"
            strokeWidth="5"
          />

          {/* Roof texture */}
          <g fill="none" stroke="#bd956a" strokeWidth="2" opacity=".55">
            <path d="M270 218 L325 184" />
            <path d="M300 225 L350 194" />
            <path d="M335 225 L380 210" />
          </g>

          {/* Window */}
          <rect
            x="290"
            y="250"
            width="35"
            height="40"
            rx="2"
            fill="url(#house-window)"
            stroke="#2c1b12"
            strokeWidth="5"
          />

          <path
            d="M307 250 V290 M290 270 H325"
            stroke="#352116"
            strokeWidth="4"
          />

          {/* Door */}
          <rect
            x="345"
            y="267"
            width="35"
            height="63"
            fill="#3b2618"
            stroke="#24160f"
            strokeWidth="4"
          />

          <circle cx="372" cy="300" r="3" fill="#d2a45b" />

          {/* Balcony */}
          <path d="M255 330 H410" stroke="#382419" strokeWidth="8" />

          <g stroke="#68452b" strokeWidth="5" fill="none">
            <path d="M260 330 V355 M290 330 V355 M320 330 V355 M350 330 V355 M380 330 V355 M405 330 V355" />
            <path d="M255 345 H410" />
          </g>

          {/* Lantern */}
          <g className="banyan-lantern">
            <path d="M400 250 V265" stroke="#27180f" strokeWidth="3" />

            <rect
              x="394"
              y="265"
              width="13"
              height="20"
              rx="3"
              fill="#d68a3c"
              stroke="#382116"
              strokeWidth="3"
            />

            <rect x="398" y="269" width="5" height="12" fill="#ffe4a0" />
          </g>
        </g>

        {/* Wide spreading roots */}
        <g className="banyan-ground-roots">
          <path
            d="M278 405
               Q247 420 217 447
               Q188 467 146 479
               Q205 492 268 460Z"
            fill="url(#bark-root)"
            stroke="#382419"
            strokeWidth="4"
          />

          <path
            d="M334 407
               Q365 426 396 449
               Q430 468 482 477
               Q430 493 355 460Z"
            fill="url(#bark-root)"
            stroke="#382419"
            strokeWidth="4"
          />

          <path
            d="M290 421
               Q272 445 256 481
               Q289 480 310 461Z"
            fill="url(#bark-root)"
          />

          <path
            d="M330 420
               Q348 445 370 481
               Q338 484 313 461Z"
            fill="url(#bark-root)"
          />

          {/* Fine root ridges */}
          <g fill="none" stroke="#d3a06b" strokeLinecap="round" opacity=".65">
            <path d="M270 418 Q233 448 170 474" strokeWidth="3" />
            <path d="M339 417 Q382 449 453 473" strokeWidth="3" />
            <path d="M292 435 Q276 459 267 477" strokeWidth="2" />
            <path d="M328 435 Q345 460 357 477" strokeWidth="2" />
          </g>
        </g>

        {/* Nest attached to a small branch */}
        <g className="parrot-nest" transform="translate(195 100) scale(.58)">
          <path
            d="M385 209 Q421 195 486 219"
            fill="none"
            stroke="#593921"
            strokeWidth="12"
            strokeLinecap="round"
          />

          <ellipse
            cx="444"
            cy="235"
            rx="47"
            ry="10"
            fill="#172719"
            opacity=".3"
          />

          {/* Twigs */}
          <path
            d="M397 215 Q410 252 444 249 Q478 252 491 215"
            fill="#57351f"
            stroke="#352218"
            strokeWidth="5"
          />

          <path
            d="M400 220 Q420 246 444 243 Q470 247 488 220"
            fill="none"
            stroke="#a87543"
            strokeWidth="5"
            strokeLinecap="round"
          />

          <g
            fill="none"
            stroke="#c08a52"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M405 229 Q430 250 455 244" />
            <path d="M416 238 L435 248" />
            <path d="M452 247 L477 231" />
            <path d="M402 218 L423 235" />
            <path d="M468 235 L489 217" />
          </g>

          <ellipse cx="444" cy="222" rx="31" ry="10" fill="#2d1c14" />

          <ellipse cx="444" cy="225" rx="23" ry="6" fill="#493020" />

          {/* Baby bird one */}
          <g className="nest-chick nest-chick-one">
            <ellipse cx="432" cy="214" rx="10" ry="12" fill="#28a95a" />

            <circle cx="434" cy="204" r="9" fill="#39bd68" />

            <path d="M441 204 Q452 203 444 211 L440 209Z" fill="#e64c35" />

            <circle cx="437" cy="201" r="2" fill="#fff" />
            <circle cx="438" cy="201" r="1" fill="#172b23" />

            <path
              className="nest-chick-wing"
              d="M425 213 Q432 208 438 216 Q432 222 425 213Z"
              fill="#16884a"
            />
          </g>

          {/* Baby bird two */}
          <g className="nest-chick nest-chick-two">
            <ellipse cx="456" cy="215" rx="9" ry="11" fill="#239d54" />

            <circle cx="457" cy="206" r="8" fill="#35b961" />

            <path d="M464 206 Q474 205 467 212 L463 210Z" fill="#e64c35" />

            <circle cx="460" cy="203" r="1.8" fill="#fff" />
            <circle cx="461" cy="203" r=".9" fill="#172b23" />

            <path
              className="nest-chick-wing"
              d="M450 214 Q456 209 462 216 Q456 221 450 214Z"
              fill="#147f45"
            />
          </g>

          {/* Nest leaves */}
          <g fill="#4c853b">
            <path d="M405 214 Q392 198 382 208 Q393 222 405 214Z" />
            <path d="M481 214 Q495 197 505 208 Q494 222 481 214Z" />
            <path d="M418 207 Q408 190 399 198 Q405 211 418 207Z" />
          </g>
        </g>
      </svg>
    </div>
  );
}
