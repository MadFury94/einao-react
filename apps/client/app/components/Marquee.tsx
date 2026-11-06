/** Equal width groups include their trailing gap, keeping the loop seamless. */
export function Marquee({ label, words }: { label: string; words: string[] }) {
	return <div className="orixo-marquee" role="img" aria-label={`${label}: ${words.join(", ")}`}>
		<div className="orixo-marquee-track" aria-hidden="true">
			{[0, 1].map(copy => <div className="orixo-marquee-group" key={copy}>
				{[0, 1].flatMap(repeat => words.map((word, i) => <span key={`${repeat}-${i}`}>{word}<b>✦</b></span>))}
			</div>)}
		</div>
	</div>;
}
