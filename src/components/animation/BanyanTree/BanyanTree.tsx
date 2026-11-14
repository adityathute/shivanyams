
"use client";

import "./BanyanTree.css";

export function BanyanTree() {
  return (
    <div className="banyan-tree">
      <svg
        viewBox="0 0 600 500"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Old banyan tree with a wooden treehouse"
      >
        <defs>
          <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#38251a" />
            <stop offset=".28" stopColor="#68442b" />
            <stop offset=".55" stopColor="#94643c" />
            <stop offset=".8" stopColor="#513522" />
            <stop offset="1" stopColor="#2e2018" />
          </linearGradient>

          <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#75934b" />
            <stop offset=".45" stopColor="#365d2d" />
            <stop offset="1" stopColor="#193b22" />
          </linearGradient>

          <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#68412a" />
            <stop offset="1" stopColor="#302018" />
          </linearGradient>

          <linearGradient id="windowLight">
            <stop stopColor="#f7c76a" />
            <stop offset="1" stopColor="#9e5526" />
          </linearGradient>

          <filter id="treeShadow">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <style>{`
          .banyan-leaf {
            transform-box: fill-box;
            transform-origin: center;
            animation: banyan-leaf-sway 5s ease-in-out infinite;
          }
          .banyan-leaf:nth-child(2n) {
            animation-delay: -2s;
            animation-duration: 6s;
          }
          .banyan-root {
            transform-box: fill-box;
            transform-origin: top center;
            animation: banyan-root-sway 7s ease-in-out infinite;
          }
          .banyan-lantern {
            animation: banyan-glow 3s ease-in-out infinite alternate;
          }
          @keyframes banyan-leaf-sway {
            0%, 100% { transform: rotate(-1deg); }
            50% { transform: rotate(1.5deg); }
          }
          @keyframes banyan-root-sway {
            0%, 100% { transform: rotate(-1deg); }
            50% { transform: rotate(1deg); }
          }
          @keyframes banyan-glow {
            from { opacity: .65; }
            to { opacity: 1; }
          }
        `}</style>

        {/* Ground shadow */}
        <ellipse
          cx="300"
          cy="472"
          rx="210"
          ry="20"
          fill="#17251a"
          opacity=".25"
          filter="url(#treeShadow)"
        />

        {/* Main branches */}
        <g fill="none" stroke="url(#bark)" strokeLinecap="round">
          <path d="M290 465 C270 350 290 245 245 145 C215 95 155 105 95 75"
            strokeWidth="48" />
          <path d="M300 420 C335 300 390 230 450 190 C490 160 525 150 560 145"
            strokeWidth="37" />
          <path d="M275 300 C220 245 170 235 115 225"
            strokeWidth="25" />
          <path d="M325 330 C375 280 430 275 480 290"
            strokeWidth="24" />
        </g>

        {/* Canopy silhouette */}
        <path
          fill="#183b24"
          d="M45 155 Q5 105 65 65 Q95 20 155 50
             Q180 5 240 40 Q300 0 350 40
             Q415 5 460 55 Q525 30 555 90
             Q620 125 560 185 Q590 230 530 255
             Q470 285 405 250 Q350 290 300 250
             Q230 285 175 250 Q105 275 65 225
             Q20 210 45 155Z"
        />

        {/* Foliage layers */}
        <g className="banyan-leaf" fill="url(#leaf)">
          <path d="M35 160 Q15 110 85 80 Q120 35 165 85 Q205 30 255 70 Q310 20 360 70 Q410 25 465 80 Q535 55 570 120 Q610 165 555 205 Q500 245 440 210 Q390 260 330 220 Q270 265 215 220 Q145 255 100 215 Q45 230 35 160Z" />
          <ellipse cx="110" cy="105" rx="80" ry="52" />
          <ellipse cx="220" cy="70" rx="90" ry="55" />
          <ellipse cx="360" cy="75" rx="90" ry="55" />
          <ellipse cx="485" cy="125" rx="85" ry="55" />
          <ellipse cx="170" cy="190" rx="100" ry="55" />
          <ellipse cx="390" cy="190" rx="110" ry="55" />
        </g>

        {/* Highlight foliage */}
        <g className="banyan-leaf" fill="#789552" opacity=".6">
          <path d="M65 100 Q100 45 150 85 Q115 105 65 100Z" />
          <path d="M205 65 Q250 25 285 75 Q250 90 205 65Z" />
          <path d="M355 65 Q405 35 430 80 Q390 95 355 65Z" />
          <path d="M480 115 Q525 75 550 130 Q510 145 480 115Z" />
        </g>

        {/* Treehouse support branches */}
        <g fill="none" stroke="#503321" strokeLinecap="round">
          <path d="M245 290 Q310 250 390 290" strokeWidth="28" />
          <path d="M255 315 Q330 280 395 310" strokeWidth="18" />
        </g>

        {/* Treehouse structure */}
        <g>
          {/* House body */}
          <path
            fill="#67452d"
            stroke="#2e2018"
            strokeWidth="5"
            d="M270 230 L395 230 L395 330 L270 330Z"
          />

          {/* Wooden planks */}
          <g stroke="#382419" strokeWidth="2" opacity=".8">
            <path d="M270 250 H395" />
            <path d="M270 270 H395" />
            <path d="M270 290 H395" />
            <path d="M270 310 H395" />
          </g>

          {/* Roof */}
          <path
            fill="url(#roof)"
            stroke="#26180f"
            strokeWidth="5"
            d="M245 235 L325 175 L420 235Z"
          />

          {/* Roof wood texture */}
          <g stroke="#a0784d" opacity=".6">
            <path d="M270 218 L325 184" />
            <path d="M300 225 L350 194" />
            <path d="M335 225 L380 210" />
          </g>

          {/* Window */}
          <rect x="290" y="250" width="35" height="40" rx="2"
            fill="url(#windowLight)" stroke="#2c1b12" strokeWidth="5" />
          <path d="M307 250 V290 M290 270 H325"
            stroke="#352116" strokeWidth="4" />

          {/* Door */}
          <rect x="345" y="267" width="35" height="63"
            fill="#3b2618" stroke="#24160f" strokeWidth="4" />
          <circle cx="372" cy="300" r="3" fill="#d2a45b" />

          {/* Balcony */}
          <path d="M255 330 H410" stroke="#382419" strokeWidth="9" />
          <g stroke="#5d3a24" strokeWidth="5">
            <path d="M260 330 V355 M290 330 V355 M320 330 V355 M350 330 V355 M380 330 V355 M405 330 V355" />
            <path d="M255 345 H410" />
          </g>

          {/* Lantern */}
          <g className="banyan-lantern">
            <path d="M400 250 V265" stroke="#27180f" strokeWidth="3" />
            <rect x="394" y="265" width="13" height="20" rx="3"
              fill="#d68a3c" stroke="#382116" strokeWidth="3" />
            <rect x="398" y="269" width="5" height="12" fill="#ffe4a0" />
          </g>
        </g>

        {/* Hanging aerial roots */}
        <g className="banyan-root" fill="none" stroke="url(#bark)"
          strokeLinecap="round">
          <path d="M135 145 Q145 220 125 330" strokeWidth="8" />
          <path d="M165 155 Q175 235 160 385" strokeWidth="6" />
          <path d="M455 155 Q445 240 465 350" strokeWidth="7" />
          <path d="M490 165 Q500 235 490 315" strokeWidth="5" />
          <path d="M215 190 Q225 245 215 310" strokeWidth="4" />
        </g>

        {/* Main trunk */}
        <path
          fill="url(#bark)"
          stroke="#352218"
          strokeWidth="5"
          d="M260 470
             Q235 390 255 325
             Q270 275 250 225
             Q280 185 305 220
             Q335 260 325 320
             Q350 390 345 470Z"
        />

        {/* Trunk texture */}
        <g fill="none" stroke="#b18a5a" strokeWidth="3" opacity=".45">
          <path d="M270 450 Q260 390 280 330 Q290 290 275 245" />
          <path d="M300 455 Q310 390 295 340 Q315 290 300 240" />
          <path d="M330 440 Q320 390 330 350" />
        </g>

        {/* Banyan roots */}
        <g fill="url(#bark)" stroke="#352218" strokeWidth="4">
          <path d="M270 430 Q220 440 190 475 L260 475Z" />
          <path d="M300 440 Q340 445 385 475 L325 475Z" />
          <path d="M260 450 Q240 465 230 480 L290 480Z" />
          <path d="M325 450 Q350 465 360 480 L300 480Z" />
        </g>
      </svg>
    </div>
  );
}
