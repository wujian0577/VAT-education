
import React from 'react';
import { StageData } from '../types';

interface StageCardProps {
  stage: StageData;
  index: number;
  onUpdateSalePrice: (id: string, newPrice: number) => void;
}

const StageCard: React.FC<StageCardProps> = ({ stage, index, onUpdateSalePrice }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-5 w-full md:w-80 flex-shrink-0 relative overflow-hidden transition-all hover:shadow-xl hover:border-blue-300">
      <div className="absolute top-0 right-0 p-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-bl-lg">
        环节 {index + 1}
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 mb-1">{stage.name}</h3>
      <p className="text-sm text-slate-500 mb-4">{stage.role}</p>

      <div className="space-y-3">
        {/* Purchase Info (Input) */}
        {index > 0 && (
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <div className="flex justify-between text-xs text-slate-500">
              <span>采购成本 (不含税)</span>
              <span>¥{stage.purchasePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-blue-600 font-medium">
              <span>进项税额 (抵扣项)</span>
              <span>¥{stage.calc.inputTax.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Sale Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            设置销售价格 (不含税)
          </label>
          <input
            type="number"
            value={stage.salePrice}
            onChange={(e) => onUpdateSalePrice(stage.id, parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-blue-50/30 border-blue-100"
          />
        </div>

        {/* Output Info */}
        <div className="p-2 bg-green-50 rounded border border-green-100">
          <div className="flex justify-between text-xs text-slate-500">
            <span>销售额 (不含税)</span>
            <span>¥{stage.salePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-red-600 font-medium">
            <span>销项税额 (待缴)</span>
            <span>¥{stage.calc.outputTax.toFixed(2)}</span>
          </div>
        </div>

        {/* Calculation Result */}
        <div className="pt-2 border-t border-dashed border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-slate-700">本环节应纳税额:</span>
            <span className="text-lg font-black text-blue-600">
              ¥{stage.calc.payableTax.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            (销项税额 ¥{stage.calc.outputTax.toFixed(2)} - 进项税额 ¥{stage.calc.inputTax.toFixed(2)})
          </p>
        </div>
      </div>
    </div>
  );
};

export default StageCard;
