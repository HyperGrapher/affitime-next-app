type Props = {
    label: string,
    name: string
}


const SocialItem: React.FC<Props> = ({ label, name }) => {
    return (
        <div className="p-2 sm:w-1/2 w-full">
            <label>
                <span className="pl-2">{label}</span>
            </label>
            <input type="text" name={name} />
        </div>
    )
}

export default SocialItem