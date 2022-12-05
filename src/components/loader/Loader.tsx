import styled from '@emotion/styled'

interface Props {
    scale?: number
}

const Loader: React.FC<Props> = ({ scale = 1 }) => (
    <Ripples scale={scale}>
        <div></div>
        <div></div>
    </Ripples>
)

export default Loader;


const Ripples = styled.div`
	display: inline-block;
	position: relative;
	width: 80px;
	height: 80px;
    transform: ${(props: Props) => `scale(${props.scale})`};

    & div:nth-of-type(2) {animation-delay: -0.5s;}
    & div {
        position: absolute;
        border: 4px solid rgb(31, 52, 98);
        opacity: 1;
        border-radius: 50%;
        animation: ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }

    @keyframes ripple {
	0% {
		top: 36px;
		left: 36px;
		width: 0;
		height: 0;
		opacity: 1;
	}
	100% {
		top: 0px;
		left: 0px;
		width: 72px;
		height: 72px;
		opacity: 0;
	}
}
`
