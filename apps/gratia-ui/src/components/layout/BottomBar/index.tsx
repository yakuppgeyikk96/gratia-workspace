import BottomBarItems from "./BottomBarItems";

interface BottomBarProps {
  isLoggedIn: boolean;
}

export default async function BottomBar(props: BottomBarProps) {
  return <BottomBarItems isLoggedIn={props.isLoggedIn} />;
}
