import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const FloatingToy = ({ shape = 'box', color = '#e0a82e', floatSpeed = 1, rotateSpeed = 0.5, floatRange = 0.8, ...props }) => {
  const meshRef = useRef();
  const initialY = useRef(props.position?.[1] || 0);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = initialY.current + Math.sin(t * floatSpeed) * floatRange;
    meshRef.current.rotation.y += rotateSpeed * 0.01;
    meshRef.current.rotation.x += rotateSpeed * 0.005;
  });

  const renderGeometry = () => {
    switch (shape) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.7, 0.7, 1.5, 32]} />;
      case 'cone':
        return <coneGeometry args={[1, 1.5, 32]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1]} />;
      default:
        return <boxGeometry args={[1.2, 1.2, 1.2]} />;
    }
  };

  return (
    <mesh ref={meshRef} {...props}>
      {renderGeometry()}
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
};

export default FloatingToy;
