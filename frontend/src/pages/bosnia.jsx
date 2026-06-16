import React from 'react';

export default function BosniaPage() {
	return (
		<div style={{fontFamily: '"Comic Sans MS", "Comic Sans", cursive'}}>
			<div style={{padding:40, textAlign:'center'}}>
				<h1 style={{
					fontSize:72,
					color:'#ff0000',
					textShadow:'3px 3px 0 #000, -2px -2px 0 #fff, 6px 6px 0 #ffa500',
					transform:'rotate(-4deg)',
					margin:'10px 0'
				}}>GET BOSNIA'D PLUH, U HAVE 10 SEC TO BOSNIA OTHER PPL</h1>

				<div style={{
					width:560,
					height:320,
					margin:'20px auto',
					background:'#0c5aa6',
					border:'8px dashed yellow',
					position:'relative',
					boxShadow:'0 12px 0 rgba(0,0,0,0.12)'
				}}>
					{/* Ugly attempt at Bosnia flag: sloppy yellow triangle and stars */}
					<div style={{
						position:'absolute',
						left:'8%',
						top:'8%',
						width:0,
						height:0,
						borderLeft:'320px solid #ffd400',
						borderTop:'160px solid transparent',
						borderBottom:'160px solid transparent',
						transform:'skewX(-10deg)'
					}} />

					{/* hand-drawn stars */}
					{Array.from({length:7}).map((_,i)=> (
						<div key={i} style={{
							position:'absolute',
							left: 60 + i*60,
							top: 40 + (i%2?20:0),
							width:22,
							height:22,
							background:'#fff',
							clipPath:'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
							transform:`rotate(${i*8}deg)`,
							boxShadow:'0 2px 0 rgba(0,0,0,0.25)'
						}} />
					))}
                    <img src="assets/images/q4fi1o1chslf1.jpeg" alt="BOSNIAAAAAA" />
					{/* terrible footer stripe */}
					<div style={{position:'absolute',bottom:0,left:0,right:0,height:40,background:'linear-gradient(90deg,#002147,#1e90ff)'}} />
				</div>

				<p style={{color:'#222', fontWeight:700, transform:'rotate(1deg)'}}>salahsatu developer kami menciptakan ini karena biar keren websitenya dikasih easter egg</p>
			</div>

            ekshyuwelli kunjungi kami di <a href="wa.me/6287762006122" style={{color:'#0c5aa6', fontWeight:700}}>https://wa.me/6287762006122</a> untuk mendapatkanwebsite keren dengan harga miring(tenang kami gaakan ngasih easter egg ngawur ini didalam projkek profesional kami)
		</div>
	);
}
