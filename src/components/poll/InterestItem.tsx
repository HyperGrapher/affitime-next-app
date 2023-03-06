type Props = {
    label: string,
    cat: string
}

const InterestItem: React.FC<Props> = ({ label, cat }) => {
    return (
        <div className="p-2 sm:w-1/2 w-full">
            <label>
                <input type="checkbox" name={cat} />
                <span className="pl-2">{label}</span>
            </label>
        </div>
    )
}

export default InterestItem