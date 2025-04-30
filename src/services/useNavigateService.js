import { useNavigate } from 'react-router-dom';

export function useNavigateService () {
    const navigate = useNavigate()
    const navigateTo = (path) => {
        navigate(path);
    }
    return { navigateTo };
}