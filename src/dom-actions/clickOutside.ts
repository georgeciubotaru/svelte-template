type Props = {
    onClickedOutside: (node: HTMLElement) => void
}
export default function clickOutside(node: HTMLElement, props: Props) {
    let { onClickedOutside } = props;
    let handleClick = (event) => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
            return onClickedOutside(node);
        }
    }
    document.addEventListener("click", handleClick, true);
    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        }
    }
};