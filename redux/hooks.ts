import { useDispatch as reduxUseDispatch } from 'react-redux';
import { AppDispatch } from './store';

export const useDispatch = () => reduxUseDispatch<AppDispatch>();
