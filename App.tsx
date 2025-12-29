
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Info, HelpCircle, TrendingUp, Wallet, ArrowRight, Building, ShoppingCart, User, RefreshCw, Zap } from 'lucide-react';
import { StageData, ChainStage } from './types';
import StageCard from './components/StageCard';
import { getVatExplanation } from './services/geminiService';

const DEFAULT_VAT_RATE = 0.13;

const INITIAL_STAGES: ChainStage[] = [
  { id: '1', name: '农户/原料商', role: '生产原材料', purchasePrice: 0, salePrice: 100, vatRate: DEFAULT_VAT_RATE },
  { id: '2', name: '面料工厂', role: '初级加工', purchasePrice: 100, salePrice: 250, vatRate: DEFAULT_VAT_RATE },
  { id: '3', name: '服装制衣厂', role: '深加工', purchasePrice: 250, salePrice: 500, vatRate: DEFAULT_VAT_RATE },
  { id: '4', name: '零售商', role: '终端销售', purchasePrice: 500, salePrice: 800, vatRate: DEFAULT_VAT_RATE },
];

const App: React.FC = () => {
  const [stages, setStages] = useState<ChainStage[]>(INITIAL_STAGES);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [currentVatRate, setCurrentVatRate] = useState<number>(13);

  // Calculate taxes whenever stages change
  const processedStages: StageData[] = useMemo(() => {
    let currentInputTax = 0;
    return stages.map((stage, index) => {
      const inputTax = index === 0 ? 0 : stages[index - 1].salePrice * (currentVatRate / 100);
      const outputTax = stage.salePrice * (currentVatRate / 100);
      const payableTax = Math.max(0, outputTax - inputTax);
      const valueAdded = index === 0 ? stage.salePrice : stage.salePrice - stages[index - 1].salePrice;

      return {
        ...stage,
        vatRate: currentVatRate / 100,
        calc: {
          inputTax,
          outputTax,
          payableTax,
          totalCost: stage.purchasePrice * (1 + currentVatRate / 100),
          totalSale: stage.salePrice * (1 + currentVatRate / 100),
          valueAdded
        }
      };
    });
  }, [stages, currentVatRate]);

  const totalTax = processedStages.reduce((sum, s) => sum + s.calc.payableTax, 0);
  const finalConsumerPrice = processedStages[processedStages.length - 1].calc.totalSale;

  const handleUpdatePrice = (id: string, newPrice: number) => {
    setStages(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, salePrice: newPrice } : s);
      // Ensure purchase price follows chain
      for (let i = 1; i < updated.length; i++) {
        updated[i].purchasePrice = updated[i - 1].salePrice;
      }
      return updated;
    });
  };

  const askAi = async () => {
    setIsLoadingAi(true);
    const analysis = await getVatExplanation(processedStages, totalTax);
    setAiAnalysis(analysis || '解析获取失败');
    setIsLoadingAi(false);
  };

  const chartData = processedStages.map(s => ({
    name: s.name,
    "本阶段缴税": s.calc.payableTax,
    "销项税": s.calc.outputTax,
    "进项税": s.calc.inputTax,
  }));

  const pieData = processedStages.map(s => ({
    name: s.name,
    value: s.calc.payableTax,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Zap className="text-blue-500 fill-blue-500" />
            中国增值税 (VAT) 全链路原理可视化
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl">
            交互式学习：调整每个环节的销售价格，观察税额如何在整个供应链中流动，最终如何影响消费者的购买价。
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">全局增值税率</label>
            <div className="flex items-center gap-2">
              <select 
                value={currentVatRate}
                onChange={(e) => setCurrentVatRate(parseInt(e.target.value))}
                className="bg-slate-100 border-none rounded px-3 py-1 font-bold text-blue-600 focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value={13}>13% (标准货物)</option>
                <option value={9}>9% (农业/交通)</option>
                <option value={6}>6% (服务业)</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => setStages(INITIAL_STAGES)}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
            title="重置数据"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Supply Chain Stages */}
        <section className="lg:col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <h2 className="text-xl font-bold text-slate-800">供应链流转</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-6">
            {processedStages.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <StageCard 
                  stage={stage} 
                  index={idx} 
                  onUpdateSalePrice={handleUpdatePrice} 
                />
                {idx < processedStages.length - 1 && (
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="text-slate-300" />
                  </div>
                )}
              </React.Fragment>
            ))}
            
            {/* Final Consumer */}
            <div className="bg-slate-800 text-white rounded-xl shadow-lg p-5 w-full md:w-80 flex-shrink-0 border-4 border-blue-500 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User size={20} className="text-blue-400" />
                  <h3 className="text-xl font-bold">最终消费者</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">增值税的最终承担者</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-sm">最终商品原价</span>
                    <span className="font-mono">¥{processedStages[processedStages.length-1].salePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-700">
                    <span className="text-sm">支付增值税 (隐藏在价内)</span>
                    <span className="text-blue-400 font-bold">¥{totalTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold">最终实付金额:</span>
                    <span className="text-2xl font-black text-white">
                      ¥{finalConsumerPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600 text-[11px] leading-relaxed text-slate-300">
                <Info size={14} className="inline mr-1 text-blue-400" />
                提示：消费者支付的税款 {totalTax.toFixed(2)} 正好等于供应链各环节缴纳的税款总和。
              </div>
            </div>
          </div>
        </section>

        {/* Data Analysis & AI Expert */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <h2 className="text-xl font-bold text-slate-800">税务数据可视化</h2>
              </div>
            </div>
            
            <div className="h-64 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="本阶段缴税" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 font-bold mb-1">各阶段贡献占比</p>
                <div className="h-40 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">核心结论</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      总税额 <span className="text-blue-600">¥{totalTax.toFixed(2)}</span> 恰好是供应链末端销售额的 {currentVatRate}%。这验证了增值税作为“最终消费税”的本质。
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="text-blue-500" size={16} />
                    <span className="text-xs text-blue-600">税制公平高效</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Building size={20} className="text-slate-400" />
              税负结构对比
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3">环节</th>
                    <th className="px-4 py-3 text-right">增值(不含税)</th>
                    <th className="px-4 py-3 text-right">进项税</th>
                    <th className="px-4 py-3 text-right">销项税</th>
                    <th className="px-4 py-3 text-right text-blue-600">本期应纳</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedStages.map((s, i) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4 font-medium text-slate-700">{s.name}</td>
                      <td className="px-4 py-4 text-right">¥{s.calc.valueAdded.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-slate-400">¥{s.calc.inputTax.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right text-slate-400">¥{s.calc.outputTax.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-bold text-blue-600">¥{s.calc.payableTax.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-800 text-white font-bold">
                    <td className="px-4 py-4 rounded-bl-xl">总计</td>
                    <td className="px-4 py-4 text-right">¥{processedStages.reduce((sum, s) => sum + s.calc.valueAdded, 0).toFixed(2)}</td>
                    <td className="px-4 py-4 text-right">-</td>
                    <td className="px-4 py-4 text-right">-</td>
                    <td className="px-4 py-4 text-right rounded-br-xl text-blue-300">¥{totalTax.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* AI Column */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white h-fit sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <HelpCircle size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Gemini 智税解析</h2>
                <p className="text-blue-100 text-xs">AI 实时分析当前供应链税情</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 min-h-[300px] flex flex-col">
              {aiAnalysis ? (
                <div className="prose prose-invert prose-sm">
                   <div className="text-blue-50 leading-relaxed whitespace-pre-line text-sm">
                    {aiAnalysis}
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <p className="text-blue-100/70 text-sm mb-6">
                    点击下方按钮，让 AI 专家为你深度解析当前的税务链路逻辑。
                  </p>
                  <div className="animate-pulse">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-300/50 flex items-center justify-center">
                      <Zap size={24} className="text-blue-300/50" />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={askAi}
                disabled={isLoadingAi}
                className="mt-8 w-full py-4 bg-white text-blue-700 font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoadingAi ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    计算中...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    获取 AI 深度解析
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] text-blue-200 uppercase font-bold mb-1">抵扣链条</p>
                <p className="text-xs">增值税是靠下一环节抵扣上一环节实现的，断链即重税。</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-[10px] text-blue-200 uppercase font-bold mb-1">中性税种</p>
                <p className="text-xs">对于合规的企业，增值税不属于其经营成本，而是代收代付。</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
             <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
               <Info size={18} />
               什么是“价外税”？
             </h4>
             <p className="text-sm text-amber-700 leading-relaxed">
               中国增值税属于<b>价外税</b>。你在商店看到的标签价 ¥{finalConsumerPrice.toFixed(2)}，其实内部已经包含了两部分：商品本身的价值 ¥{processedStages[processedStages.length-1].salePrice.toFixed(2)} 和税款 ¥{totalTax.toFixed(2)}。
               <br/><br/>
               对于企业来说，他们只保留商品价值，收到的税款都要最终交给国家。
             </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2024 增值税原理可视化教学工具 | 使用 React & Gemini API 构建</p>
      </footer>
    </div>
  );
};

export default App;
