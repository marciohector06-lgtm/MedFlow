import logoImg from '../assets/logo.png';

export default function Logo({ width = "250" }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src={logoImg} 
        alt="MedFlow" 
        style={{ width: `${width}px`, height: 'auto', objectFit: 'contain' }} 
      />
    </div>
  );
}