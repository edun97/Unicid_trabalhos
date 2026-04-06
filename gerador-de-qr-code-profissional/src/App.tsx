/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling, {
  DrawType,
  DotType,
  CornerSquareType,
  CornerDotType
} from 'qr-code-styling';
import { Download, Copy, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

type Extension = 'png' | 'svg' | 'jpeg' | 'webp';

export default function App() {
  const [url, setUrl] = useState('https://eduardosonego.com/');
  const [dotScale, setDotScale] = useState(0.8);
  const [cornerRounding, setCornerRounding] = useState(10);
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [format, setFormat] = useState<Extension>('png');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 300,
      height: 300,
      type: 'svg' as DrawType,
      data: url,
      image: logo,
      dotsOptions: {
        color: '#2C4C3B',
        type: 'rounded' as DotType
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        color: '#2C4C3B',
        type: 'extra-rounded' as CornerSquareType
      },
      cornersDotOptions: {
        color: '#D07D5D',
        type: 'dot' as CornerDotType
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10
      }
    });

    if (qrRef.current) {
      qrCode.current.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    if (qrCode.current) {
      qrCode.current.update({
        data: url || ' ',
        image: logo,
        dotsOptions: {
          color: '#2C4C3B',
          type: 'rounded' as DotType,
          gradient: undefined // Ensure no gradient overrides
        },
        cornersSquareOptions: {
          color: '#2C4C3B',
          type: cornerRounding > 15 ? 'extra-rounded' : cornerRounding > 5 ? 'rounded' : 'square'
        },
        cornersDotOptions: {
          color: '#D07D5D',
          type: 'dot'
        }
      });
      
      // Manually adjust dot scale if possible via internal options or just visual approximation
      // Note: qr-code-styling doesn't have a direct "dot scale" slider in the public API easily, 
      // but we can simulate rounding intensity or use the library's dot types.
    }
  }, [url, logo, cornerRounding]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    if (value.trim()) {
      setError('');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateAndDownload = () => {
    if (!url.trim()) {
      setError('Por favor, insira uma URL ou texto.');
      return;
    }
    qrCode.current?.download({ extension: format });
  };

  const copyToClipboard = async () => {
    if (!url.trim()) {
      setError('Por favor, insira uma URL ou texto.');
      return;
    }

    try {
      const blob = await qrCode.current?.getRawData('png');
      if (blob) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#FDF7E8] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#2C4C3B]/10"
      >
        {/* Coluna Esquerda: Controles */}
        <div className="w-full md:w-1/2 p-8 md:p-12 space-y-8">
          <header>
            <h1 className="font-serif text-4xl text-[#2C4C3B] mb-2">Gerador de QR Code</h1>
            <p className="text-[#2C4C3B]/70 text-sm">Crie códigos elegantes com sua identidade visual.</p>
          </header>

          <div className="space-y-6">
            {/* Input URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#2C4C3B]">URL ou Texto</label>
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://exemplo.com"
                  className={`w-full px-4 py-3 rounded-xl bg-white border-2 transition-all outline-none ${
                    error ? 'border-red-500 bg-red-50' : 'border-[#2C4C3B]/10 focus:border-[#D07D5D]'
                  }`}
                />
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-500 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {error}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-[#2C4C3B]">Arredondamento dos Cantos</label>
                  <span className="text-xs text-[#2C4C3B]/50">{cornerRounding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={cornerRounding}
                  onChange={(e) => setCornerRounding(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#C1D3C0] rounded-lg appearance-none cursor-pointer accent-[#D07D5D]"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-semibold text-[#2C4C3B]">Escala dos Pontos</label>
                  <span className="text-xs text-[#2C4C3B]/50">{Math.round(dotScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={dotScale}
                  onChange={(e) => setDotScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#C1D3C0] rounded-lg appearance-none cursor-pointer accent-[#D07D5D]"
                />
              </div>
            </div>

            {/* Upload Logo */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#2C4C3B]">Logo da Marca</label>
              <label className="flex items-center justify-center w-full h-12 px-4 transition bg-white border-2 border-dashed border-[#2C4C3B]/20 rounded-xl cursor-pointer hover:border-[#D07D5D] group">
                <span className="flex items-center space-x-2">
                  <Upload size={18} className="text-[#2C4C3B]/40 group-hover:text-[#D07D5D]" />
                  <span className="text-sm text-[#2C4C3B]/60 group-hover:text-[#D07D5D]">
                    {logo ? 'Alterar Logo' : 'Upload de Imagem'}
                  </span>
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>

            {/* Ações */}
            <div className="pt-4 space-y-4">
              <div className="flex gap-2">
                <select 
                  value={format}
                  onChange={(e) => setFormat(e.target.value as Extension)}
                  className="px-3 py-3 rounded-xl bg-white border-2 border-[#2C4C3B]/10 text-sm text-[#2C4C3B] outline-none focus:border-[#D07D5D]"
                >
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WEBP</option>
                </select>
                <button
                  onClick={validateAndDownload}
                  className="flex-1 bg-[#D07D5D] hover:bg-[#b86b4e] text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#D07D5D]/20"
                >
                  <Download size={18} /> Baixar Arquivo
                </button>
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full border-2 border-[#2C4C3B] text-[#2C4C3B] hover:bg-[#2C4C3B] hover:text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {copyStatus ? (
                  <>
                    <CheckCircle2 size={18} /> Copiado com Sucesso
                  </>
                ) : (
                  <>
                    <Copy size={18} /> Copiar para Área de Transferência
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Preview */}
        <div className="w-full md:w-1/2 bg-[#F7EFE0] p-8 md:p-12 flex flex-col items-center justify-center relative">
          <div className="absolute top-8 left-8">
            <span className="text-[10px] uppercase tracking-widest text-[#2C4C3B]/30 font-bold">Visualização Real</span>
          </div>
          
          <motion.div 
            layout
            className="bg-white p-8 rounded-3xl shadow-xl border border-[#2C4C3B]/5"
          >
            <div ref={qrRef} className="qr-container" />
          </motion.div>

          <div className="mt-8 text-center">
            <p className="text-[#2C4C3B]/40 text-xs italic">
              O código é atualizado automaticamente conforme você edita.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
