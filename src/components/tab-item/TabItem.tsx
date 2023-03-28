import classNames from "../../utils/classnames";
import { Tab } from '@headlessui/react'
import { useRouter } from "next/router";

type TabProps = {
    id: string,
    selected: number,
    query: string,
    title: string
}

const TabItem: React.FC<TabProps> = ({ id, selected, query, title }) => {

    const { push } = useRouter()

    return (
        <Tab
            className={classNames(
                "bg-slate-100 py-1 text-xs sm:text-sm text-slate-500",
                `${String(selected) === id && "underline underline-offset-8 "}`,
                'outline-0 font-medium whitespace-nowrap',
            )}
            onClick={() => push({ query: { tab: query } })}>
            {title}
        </Tab>
    )
}

export default TabItem