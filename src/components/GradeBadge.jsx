import React from 'react';

const GradeBadge = ({ grade }) => {
  const styles = {
    light: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    heavy: "bg-stone-600/20 text-stone-400 border-stone-600/30",
  };
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${styles[grade]}`}>
      {grade}
    </span>
  );
};

export default GradeBadge;
