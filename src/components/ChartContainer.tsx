import React from 'react';

interface ChartContainerProps {
  title: string;
  icon1?: React.ReactElement;
  icon2?: React.ReactElement;
  children: React.ReactNode;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, icon1, icon2, children, className }) => {
  return (
    <div className={`bg-gray-900 border border-gray-700 shadow-lg rounded-lg p-6 relative ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-sky-300 inline-flex items-center gap-2">{icon1} {title} {icon2}</h3>
      {children}
    </div>
  );
};

export default ChartContainer;
