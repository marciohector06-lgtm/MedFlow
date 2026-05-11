import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../services/api';

export default function ScannerEstoque({ onUpdate }) {
  const [lendo, setLendo] = useState(false);

  useEffect(() => {
    if (!lendo) return;

    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    });

    scanner.render(async (decodedText) => {
      try {
        await api.put(`/produtos/${decodedText}/baixa`, { quantidade: 1 });
        scanner.clear();
        setLendo(false);
        if (onUpdate) onUpdate();
        alert("Item retirado do estoque!");
      } catch (error) {
        console.error("Erro na leitura:", error);
      }
    }, (error) => {});

    return () => scanner.clear();
  }, [lendo]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {!lendo ? (
        <button 
          onClick={() => setLendo(true)} 
          style={{ padding: '15px 30px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📷 ATIVAR SCANNER DE SAÍDA
        </button>
      ) : (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div id="reader"></div>
          <button 
            onClick={() => setLendo(false)} 
            style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}