
import React from 'react';
import { CameraStatus } from '../types';

interface CameraFieldOfVisionProps {
  rotation: number;
  fov: number;
  range: number;
  status: CameraStatus;
}

const CameraFieldOfVision: React.FC<CameraFieldOfVisionProps> = ({ rotation, fov, range, status }) => {
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', x, y,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', x, y,
      'Z',
    ].join(' ');
  };

  const startAngle = rotation - fov / 2;
  const endAngle = rotation + fov / 2;
  const pathData = describeArc(0, 0, range, startAngle, endAngle);

  const getFovColors = () => {
    switch (status) {
      case CameraStatus.PROBLEMA: return { fill: 'rgba(244, 63, 94, 0.15)', stroke: 'rgba(244, 63, 94, 0.4)' };
      case CameraStatus.MANUTENCAO: return { fill: 'rgba(245, 158, 11, 0.15)', stroke: 'rgba(245, 158, 11, 0.4)' };
      default: return { fill: 'rgba(16, 185, 129, 0.15)', stroke: 'rgba(16, 185, 129, 0.4)' };
    }
  };

  const colors = getFovColors();

  return (
    <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
      <path
        d={pathData}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="1.5"
        strokeDasharray="4 2"
        className="transition-all duration-300"
      />
    </svg>
  );
};

export default CameraFieldOfVision;
