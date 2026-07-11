import { useState, useRef, useEffect } from 'react';
import { X, Upload, Video, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoGeneratorModal({ isOpen, onClose }: VideoGeneratorModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('製作一部吸引人的瑪卡商品宣傳影片，展示產品活力與精神');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'downloading' | 'completed' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (status !== 'completed' && status !== 'generating' && status !== 'downloading') {
        setStatus('idle');
        setVideoUrl(null);
        setErrorMsg('');
        setOperationName(null);
      }
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleGenerate = async () => {
    if (!preview) return;
    
    setIsGenerating(true);
    setStatus('generating');
    setErrorMsg('');
    setVideoUrl(null);

    try {
      // Extract base64 and mimetype
      const mimeType = file?.type || 'image/jpeg';
      const base64Data = preview.split(',')[1];

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBytes: base64Data,
          mimeType,
          aspectRatio
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to start video generation');
      }

      const { operationName: opName } = await res.json();
      setOperationName(opName);
      
      pollStatus(opName);

    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred');
      setIsGenerating(false);
    }
  };

  const pollStatus = async (opName: string) => {
    try {
      const res = await fetch('/api/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName })
      });
      
      const { done } = await res.json();
      
      if (done) {
        setStatus('downloading');
        downloadVideo(opName);
      } else {
        // poll again in 10 seconds
        setTimeout(() => pollStatus(opName), 10000);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error checking status');
      setIsGenerating(false);
    }
  };

  const downloadVideo = async (opName: string) => {
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName })
      });

      if (!res.ok) {
        throw new Error('Failed to download video');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus('completed');
      setIsGenerating(false);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Error downloading video');
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 text-black p-2 rounded-xl">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI 宣傳影片生成器</h2>
                <p className="text-sm text-gray-500">上傳商品圖片，自動為您生成吸睛影片 (Veo 引擎)</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {status === 'completed' && videoUrl ? (
              <div className="space-y-6">
                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-medium">
                  🎉 影片生成完成！
                </div>
                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-[50vh]"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => {
                      setStatus('idle');
                      setVideoUrl(null);
                    }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    再做一支
                  </button>
                  <a 
                    href={videoUrl} 
                    download="promo-video.mp4"
                    className="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    下載影片
                  </a>
                </div>
              </div>
            ) : status === 'generating' || status === 'downloading' ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
                  <div className="w-24 h-24 border-4 border-black rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-black">
                    <Video className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {status === 'generating' ? 'AI 正在魔法生成中...' : '正在下載您的專屬影片...'}
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    {status === 'generating' 
                      ? '這需要幾分鐘的時間，我們正在為您的商品製作最吸睛的動態效果。您可以先關閉視窗，稍後再回來查看。' 
                      : '即將完成，準備驚艷您的觀眾！'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Image Upload Area */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">1. 上傳商品圖片</label>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  
                  {preview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
                      <div className="aspect-video md:aspect-[21/9] flex items-center justify-center p-4">
                        <img src={preview} alt="Preview" className="max-w-full max-h-[30vh] object-contain rounded-lg shadow-sm" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/20 backdrop-blur-md text-white px-6 py-2 rounded-full font-medium border border-white/30 hover:bg-white/30"
                        >
                          更換圖片
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors"
                    >
                      <div className="bg-gray-50 text-black p-4 rounded-full mb-4">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h4 className="text-gray-900 font-medium mb-1">點擊上傳商品圖片</h4>
                      <p className="text-sm text-gray-500">支援 JPG, PNG 格式 (最高 50MB)</p>
                    </div>
                  )}
                </div>

                {/* Video Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">2. 影片比例</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setAspectRatio('16:9')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${aspectRatio === '16:9' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        16:9 (橫向 - 適合網站/YouTube)
                      </button>
                      <button 
                        onClick={() => setAspectRatio('9:16')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${aspectRatio === '9:16' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        9:16 (直向 - 適合 Reels/Shorts)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">3. 腳本提示詞</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-700 text-sm resize-none h-24"
                      placeholder="描述您想要的影片內容..."
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
                    {errorMsg}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {status === 'idle' && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleGenerate}
                disabled={!preview || isGenerating}
                className={`px-8 py-2.5 font-medium rounded-xl flex items-center gap-2 transition-colors ${
                  !preview 
                    ? 'bg-gray-300 text-white cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800 shadow-md shadow-gray-200'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                開始生成
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
