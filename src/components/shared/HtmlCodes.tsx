
type Props = {
    size?: string
}
export const Lira: React.FC<Props> = ({size='11px'}) => <span
    style={{ fontSize: size, fontWeight: '400', fontFamily: 'sans-serif' }}>
    &#8378;
</span>

export const Space = () => <>&nbsp;</>

