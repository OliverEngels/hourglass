interface BadgeProps {
    color: string
    text: string
    onRemove?: (text: string) => void;
}
const Tag: React.FC<BadgeProps> = ({ color, text, onRemove }) => {
    return (
        <span className={`relative flex items-center justify-center rounded-md bg-${color}-50 px-2 py-1 text-xs font-medium text-${color}-400 ring-1 ring-inset ring-${color}-500/10 ml-1 mb-1`}>

            <span>{text}</span>

            {onRemove != null && <button className={`ml-1 fill-current relative rounded hover:bg-${color}-100`} onMouseUp={() => onRemove(text)}>
                <svg className={`h-4 w-4 p-0.5`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>
            </button>}

        </span>
    )
}

export default Tag;