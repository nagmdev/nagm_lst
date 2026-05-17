import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', 
      width: '100vw', 
      position: 'fixed', 
      top: 0,
      left: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
      zIndex: 1000, 
    }}>
      <Loader2 className="animate-spin" size={48} color="#000" />
    </div>
  );
};

export default LoadingSpinner;