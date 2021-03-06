// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as moment from "moment";

import * as React from "react";

import { DialogType } from "readium-desktop/common/models/dialog";

import * as dialogActions from "readium-desktop/common/redux/actions/dialog";

import { PublicationView } from "readium-desktop/common/views/publication";

import { withApi } from "readium-desktop/renderer/components/utils/api";

import SVG from "readium-desktop/renderer/components/utils/SVG";

import * as MenuIcon from "readium-desktop/renderer/assets/icons/menu.svg";

import uuid = require("uuid");
import AccessibleMenu from "../utils/menu/AccessibleMenu";
import { TranslatorProps, withTranslator } from "../utils/translator";

import * as styles from "readium-desktop/renderer/assets/styles/myBooks.css";

interface PublicationListElementProps extends TranslatorProps {
    publication: PublicationView;
    deletePublication?: any;
    displayPublicationInfo?: any;
    openDeleteDialog?: any;
    menuContent: any;
}

interface PublicationListElementState {
    menuOpen: boolean;
}

export class PublicationListElement extends React.Component<PublicationListElementProps, PublicationListElementState> {
    private menuId: string;
    private buttonRef: any;

    constructor(props: any) {
        super(props);

        this.state = {
            menuOpen: false,
        };

        this.deletePublication = this.deletePublication.bind(this);
        this.displayPublicationInfo = this.displayPublicationInfo.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.focusButton = this.focusButton.bind(this);

        this.menuId = "menu-" + uuid.v4();
    }

    public render(): React.ReactElement<{}>  {
        const pub = this.props.publication;
        const formatedPublishers = pub.publishers.join(", ");
        let formatedPublishedYear = "";
        const { __, translator } = this.props;

        if (pub.publishedAt) {
            formatedPublishedYear = "" + moment(pub.publishedAt).year();
        }

        return (
            <>
                <div className={styles.publicationLine}>
                    <button
                        type="button"
                        aria-expanded={this.state.menuOpen}
                        aria-controls={this.menuId}
                        title={this.props.publication.title}
                        onClick={this.toggleMenu}
                        ref={(ref) => this.buttonRef = ref}
                    >
                        <SVG svg={MenuIcon}/>
                    </button>
                    <div className={styles.list_book_title}>
                    <p className={styles.book_title} aria-label={ __("accessibility.bookTitle")}>{ pub.title }</p>
                    <p
                        className={`${styles.book_author} ${styles.lightgrey}`}
                        aria-label={ __("accessibility.bookAuthor")}
                    >
                        {pub.authors.map((author) => translator.translateContentField(author)).join(", ")}
                    </p>
                    </div>
                    <p className={styles.infos_sup} aria-label={ __("accessibility.bookReleaseDate")}>
                    { formatedPublishedYear}</p>
                    <p className={styles.infos_sup} aria-label={ __("accessibility.bookPublisher")}>
                    { formatedPublishers }</p>
                </div>
                { this.state.menuOpen &&
                    <AccessibleMenu
                        toggleMenu={this.toggleMenu}
                        focusMenuButton={this.focusButton}
                        visible={this.state.menuOpen}
                    >
                        <div
                            id={this.menuId}
                            className={(this.state.menuOpen ? styles.menu_open + " " : "") + styles.list_menu}
                        >
                            {this.props.menuContent}
                        </div>
                    </AccessibleMenu>
                }
            </>
        );
    }

    private deletePublication(e: any) {
        e.preventDefault();
        this.props.openDeleteDialog(this.props.publication);
    }

    private displayPublicationInfo(e: any) {
        e.preventDefault();
        this.props.displayPublicationInfo(this.props.publication);
    }

    private toggleMenu() {
        this.setState({menuOpen: !this.state.menuOpen});
    }

    private focusButton() {
        this.buttonRef.focus();
    }
}

const mapDispatchToProps = (dispatch: any, __1: PublicationListElementProps) => {
    return {
        displayPublicationInfo: (publication: PublicationView) => {
            dispatch(dialogActions.open(
                DialogType.PublicationInfo,
                {
                    publication: {
                        identifier: publication.identifier,
                    },
                },
            ));
        },
        openDeleteDialog: (publication: string) => {
            dispatch(dialogActions.open(
                DialogType.DeletePublicationConfirm,
                {
                    publication,
                },
            ));
        },
    };
};

export default withTranslator(withApi(
    PublicationListElement,
    {
        operations: [
            {
                moduleId: "publication",
                methodId: "delete",
                callProp: "deletePublication",
            },
        ],
        mapDispatchToProps,
    },
));
