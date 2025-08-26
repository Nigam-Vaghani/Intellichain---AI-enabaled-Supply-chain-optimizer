import React from 'react';
import { AIInsight } from '../services/api';
import { Brain, Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface AIInsightsProps {
  insights: AIInsight[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return <Brain className="h-5 w-5 text-blue-400" />;
      case 'holiday':
        return <Calendar className="h-5 w-5 text-orange-400" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      default:
        return <Brain className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-700 p-8">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl mr-3">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">AI Insights & Predictions</h3>
      </div>
      
      <div className="space-y-5">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="p-5 rounded-xl bg-gray-800 border border-gray-700 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                {getInsightIcon(insight.type)}
                <div className="ml-4">
                  <h4 className="text-sm font-bold text-white">{insight.title}</h4>
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed">{insight.message}</p>
                </div>
              </div>
              <div className="flex items-center">
                <AlertCircle
                  className={`h-4 w-4 mr-2 ${
                    insight.severity === 'high'
                      ? 'text-red-400'
                      : insight.severity === 'medium'
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}
                />
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    insight.severity === 'high'
                      ? 'bg-red-700 text-red-100'
                      : insight.severity === 'medium'
                      ? 'bg-yellow-700 text-yellow-100'
                      : 'bg-green-700 text-green-100'
                  }`}
                >
                  {insight.severity}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <button className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium">
                {insight.action}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
