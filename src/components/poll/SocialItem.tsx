import classNames from "../../utils/classnames"

type Props = {
    label: string,
    name: string
}

const SocialItem: React.FC<Props> = ({ label, name }) => {
    return (
        <div className="p-2 sm:w-1/2 w-full flex flex-col">
            <label>
                <span className="pl-2 text-slate-500 font-medium">{label}</span>
            </label>
            <input type="text" name={name} className={classNames(
                'block w-full rounded-md shadow-sm sm:text-sm',
                'disabled:bg-slate-200 border-gray-300 transition-colors',
                'focus:border-indigo-500 focus:ring-indigo-500'
            )} />
        </div>
    )
}

export default SocialItem