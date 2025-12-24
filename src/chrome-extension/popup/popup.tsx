import { createRoot } from 'react-dom/client';
import { Popup } from './index';
import '../global.css';

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
