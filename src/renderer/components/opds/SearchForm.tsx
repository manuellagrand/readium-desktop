// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import * as SearchIcon from "readium-desktop/renderer/assets/icons/baseline-search-24px-grey.svg";
import * as styles from "readium-desktop/renderer/assets/styles/header.css";
import SVG from "readium-desktop/renderer/components/utils/SVG";

import { RouteComponentProps, withRouter } from "react-router-dom";
import { TranslatorProps, withTranslator } from "readium-desktop/renderer/components/utils/translator";

interface OpdsProps extends TranslatorProps, RouteComponentProps {}

export class SearchForm extends React.Component<OpdsProps, undefined> {
    private inputRef: any;

    public constructor(props: any) {
        super(props);

        this.inputRef = React.createRef();

        this.search = this.search.bind(this);
    }
    public render(): React.ReactElement<{}> {
        const { __ } = this.props;
        return (
            <form onSubmit={this.search} role="search">
                <input
                    ref={this.inputRef}
                    type="search"
                    id="menu_search"
                    aria-label={__("accessibility.searchBook")}
                    placeholder={__("header.searchPlaceholder")}
                />
                <button id={styles.search_img}>
                    <SVG svg={SearchIcon} title={__("header.searchTitle")}/>
                </button>
            </form>
        );
    }

    public search(e: any) {
        e.preventDefault();
        const value = this.inputRef.current.value;

        this.props.history.push("/opds/" + (this.props.match.params as any).opdsId + "/search/text/" + value);
    }
}

export default withTranslator(withRouter(SearchForm));
