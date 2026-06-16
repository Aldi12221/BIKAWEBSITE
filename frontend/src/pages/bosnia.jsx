import React from 'react';

export default function BosniaPage() {
	return (
		<div style={{fontFamily: '"Comic Sans MS", "Comic Sans", cursive'}}>
			<div style={{padding:40, textAlign:'center'}}>
				<h1 style={{
					fontSize:72,
					color:'#b30000',
					textShadow:'4px 4px 0 #000, -3px -3px 0 #fff',
					transform:'rotate(-3deg)',
					margin:'10px 0'
				}}>GET BOSNIA'D PLUH, U HAVE 10 SEC TO BOSNIA OTHER PPL</h1>

				<div style={{
					width:560,
					height:320,
					margin:'20px auto',
					background:'#002f6c', /* deeper blue */
					border:'6px solid #ffd400',
					position:'relative',
					overflow:'hidden',
					boxShadow:'0 16px 0 rgba(0,0,0,0.18)'
				}}>
					{/* More correct triangle (pointing to the right) */}
					<div style={{
						position:'absolute',
						left:0,
						top:0,
						bottom:0,
						width:'46%',
						background:'#ffd400',
						clipPath:'polygon(0 0, 100% 50%, 0 100%)',
						transform:'skewX(-4deg)'
					}} />

					{/* White stars along the hypotenuse (some partially clipped) */}
					{Array.from({length:9}).map((_,i)=> {
						const left = 28 + i*30; // along diagonal
						const top = 28 + i*22;
						return (
							<div key={i} style={{
								position:'absolute',
								left: `${left}px`,
								top: `${top}px`,
								width:18,
								height:18,
								background:'#fff',
								clipPath:'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
								transform:`rotate(${i*6}deg)`,
								boxShadow:'0 1px 0 rgba(0,0,0,0.25)'
							}} />
						);
					})}

					{/* Slightly ugly decorative watermark image */}
					<img src="assets/images/q4fi1o1chslf1.jpeg" alt="BOSNIA" style={{position:'absolute', right:8, bottom:8, width:120, opacity:0.85, transform:'rotate(-6deg)', border:'2px solid rgba(255,255,255,0.6)'}} />

					{/* crude bottom stripe */}
					<div style={{position:'absolute',bottom:0,left:0,right:0,height:36,background:'linear-gradient(90deg,#001f4b,#1e90ff)'}} />
				</div>

				<p style={{color:'#222', fontWeight:700, transform:'rotate(1deg)', marginTop:12}}>salahsatu developer kami menciptakan ini karena biar keren websitenya dikasih easter egg dan ini adalah percobaan terbaiknya untuk membuat bendera bosnia dengan css murni</p>
			</div>

			ekshyuwelli kunjungi kami di <a href="https://wa.me/6287762006122" style={{color:'#0c5aa6', fontWeight:700}}>https://wa.me/6287762006122</a> untuk mendapatkanwebsite keren dengan harga miring (tenang kami gaakan ngasih easter egg ngawur ini didalam projkek profesional kami)
		</div>
	);
}
