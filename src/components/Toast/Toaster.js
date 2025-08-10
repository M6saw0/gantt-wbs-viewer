import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useUiStore } from '../../store/uiStore';
import './Toaster.css';
export const Toaster = () => {
    const { toasts, dismissToast } = useUiStore();
    if (toasts.length === 0)
        return null;
    return (_jsx("div", { className: "toaster", children: toasts.map(toast => (_jsxs("div", { className: `toast toast-${toast.type}`, onClick: () => dismissToast(toast.id), children: [_jsxs("div", { className: "toast-icon", children: [toast.type === 'success' && '✓', toast.type === 'error' && '✕', toast.type === 'warning' && '⚠', toast.type === 'info' && 'ℹ'] }), _jsx("div", { className: "toast-message", children: toast.message }), _jsx("button", { className: "toast-close", onClick: (e) => {
                        e.stopPropagation();
                        dismissToast(toast.id);
                    }, children: "\u2715" })] }, toast.id))) }));
};
