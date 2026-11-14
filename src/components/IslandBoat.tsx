export function IslandBoat() {
  return (
    <g className="davao_bob">
      <path d="M-28 6 Q-23 9 23 8 L29 5 Q20 6 -24 5Z" fill="#d8ad69" stroke="#79502b" strokeWidth="0.8" />
      <path d="M-17 6 L-12 -2 M16 6 L12 -2" stroke="#f4d18d" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M-18 -4 Q0 0 18 -5 Q13 6 1 7 Q-12 7 -18 -4Z" fill="#8a4b22" stroke="#4e2810" strokeWidth="1" />
      <path d="M-15 -2 Q1 2 15 -3" fill="none" stroke="#f6cd84" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M0 -3 L0 -34" stroke="#5a3418" strokeWidth="1.8" strokeLinecap="round" />
      <g className="davao_sail">
        <path d="M1 -32 Q7 -28 11 -22 Q6 -22 1 -23Z" fill="#ff7869" />
        <path d="M1 -23 Q6 -22 11 -22 Q15 -17 18 -14 Q9 -12 1 -14Z" fill="#ffd166" />
        <path d="M1 -14 Q9 -12 18 -14 Q21 -10 23 -6 Q12 -2 1 -6Z" fill="#4dabf7" />
        <path d="M3 -30 Q5 -18 4 -7" fill="none" stroke="#fff" strokeOpacity=".48" strokeWidth=".8" />
      </g>
      <path className="davao_pennant" d="M0 -34 Q-5 -38 -12 -34 L-10 -32 Q-5 -35 0 -32Z" fill="#ffd166" />
      <circle cy="-35" r="1.4" fill="#ffb53d" />
    </g>
  );
}
