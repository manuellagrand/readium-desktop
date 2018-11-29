import * as React from "react";
import * as ReactDOM from "react-dom";
import * as uuid from "uuid";

import MenuButton from "./MenuButton";
import MenuContent from "./MenuContent";
import { NONAME } from "dns";

interface ContentStyle {
    [key: string]: any;
}

interface MenuProps {
    button: any;
    content: any;
    open: boolean; // Is menu open
    dir: string; // Direction of menu: right or left
}

interface MenuState {
    open: boolean;
    contentStyle: any;
}

const CLICKABLE_TAGS = [
    "a",
    "button",
];

export default class Menu extends React.Component<MenuProps, MenuState> {
    private buttonRef: any;
    private menuId: string;

    public constructor(props: any) {
        super(props);
        this.state = {
            open: props.open,
            contentStyle: {},
        };
        this.menuId = "menu-" + uuid.v4();
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
    }

    public componentWillUnmount() {
        document.removeEventListener("click", this.handleGlobalClick);
        document.removeEventListener("keydown", this.handleGlobalKeydown);
    }

    public componentDidMount() {

        // Find button position
        const buttonElement = ReactDOM.findDOMNode(this.buttonRef) as HTMLElement;

        // Refresh position of menu content
        const buttonClientRect = buttonElement.getBoundingClientRect();
        const contentStyle: ContentStyle = {
            display: "none",
            position: "absolute",
            top: "" + Math.round(buttonClientRect.top + buttonClientRect.height) + "px",
        };

        if (this.props.dir === "right") {
            // Right direction
            contentStyle.right = Math.round(window.innerWidth - buttonClientRect.right) + "px";
        } else {
            // Left direction
            contentStyle.left = Math.round(buttonClientRect.left) + "px";
        }

        this.setState({
            contentStyle,
        });

        document.addEventListener("click", this.handleGlobalClick);
        document.addEventListener("keydown", this.handleGlobalKeydown);
    }

    public render(): React.ReactElement<{}> {
        const { open } = this.state;
        const contentStyle = Object.assign({}, this.state.contentStyle);
        
        if (open) {
            contentStyle.display = "block";
        }

        return (
            <>
                <MenuButton
                    ref={(ref) => { this.buttonRef = ref; }}
                    menuId={this.menuId}
                    open={open}
                >
                    {this.props.button}
                </MenuButton>
                <MenuContent
                    menuId={this.menuId}
                    menuOpen={open}
                    menuDir={this.props.dir}
                    menuStyle={contentStyle}
                >
                    {this.props.content}
                </MenuContent>
            </>
        );
    }

    public handleGlobalKeydown(event: any) {
        const key = event.key;

        if (key === "Escape" && this.state.open) {
            this.setState({
                open: false,
            });

            // Focus button
            const buttonElement = ReactDOM.findDOMNode(this.buttonRef) as HTMLElement;
            buttonElement.focus();
        }
    }

    public handleGlobalClick(event: any) {
        const buttonElement = ReactDOM.findDOMNode(this.buttonRef) as HTMLElement;
        const targetElement: HTMLElement = event.target;
        const contentElement = document.getElementById(this.menuId);

        if (buttonElement.contains(targetElement)) {
            const contentStyle = Object.assign({}, this.state.contentStyle);
            
            // Find button position
            const buttonElement = ReactDOM.findDOMNode(this.buttonRef) as HTMLElement;

            // Refresh position of menu content
            const buttonClientRect = buttonElement.getBoundingClientRect();

            if (this.props.dir === "right") {
                // Right direction
                contentStyle.right = Math.round(window.innerWidth - buttonClientRect.right) + "px";
            } else {
                // Left direction
                contentStyle.left = Math.round(buttonClientRect.left) + "px";
            }
            // Click on button: toggle menu
            this.setState({
                contentStyle,
                open: !this.state.open,
            });

            return;
        }

        if (!contentElement.contains(targetElement)) {
            this.setState({
                open: false,
            });
        } else {
            if (CLICKABLE_TAGS.indexOf(targetElement.tagName.toLowerCase()) > -1) {
                // This is a link => close menu
                this.setState({
                    open: false,
                });
            }
        }
    }
}