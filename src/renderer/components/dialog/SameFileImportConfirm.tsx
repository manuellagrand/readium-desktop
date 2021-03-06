// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import { OpdsPublicationView } from "readium-desktop/common/views/opds";

import { withApi } from "readium-desktop/renderer/components/utils/api";
import { TranslatorProps } from "readium-desktop/renderer/components/utils/translator";

import { dialogActions } from "readium-desktop/common/redux/actions";

import * as styles from "readium-desktop/renderer/assets/styles/dialog.css";

interface Props extends TranslatorProps {
    publication: OpdsPublicationView;
    importOpdsEntry?: (data: any) => any;
    downloadSample?: boolean;
    closeDialog?: any;
}

class SameFileImportConfirm extends React.Component<Props> {
    public constructor(props: any) {
        super(props);

        this.state = {
            menuOpen: false,
        };

        this.addToCatalog = this.addToCatalog.bind(this);
    }

    public render(): React.ReactElement<{}>  {
        const { __, publication } = this.props;
        return (
            <div>
                <p>
                {__("dialog.alreadyAdd")}
                    <span>{this.props.publication.title}</span>
                </p>
                <p>{__("dialog.sure")}</p>
                <div>
                    <button onClick={this.addToCatalog}>{__("dialog.yes")}</button>
                    <button className={styles.primary} onClick={this.props.closeDialog}>{__("dialog.no")}</button>
                </div>
            </div>
        );
    }

    private addToCatalog() {
        this.props.importOpdsEntry(
            {
                url: this.props.publication.url,
                base64OpdsPublication: this.props.publication.base64OpdsPublication,
                downloadSample: this.props.downloadSample,
                title: this.props.publication.title,
            },
        );
        this.props.closeDialog();
    }
}

const buildRequestData = (props: Props) => {
    return { text: props.publication.title };
};

const mapDispatchToProps = (dispatch: any, props: any) => {
    return {
        closeDialog: () => {
            dispatch(
                dialogActions.close(),
            );
        },
    };
};

export default withApi(
    SameFileImportConfirm,
    {
        operations: [
            {
                moduleId: "publication",
                methodId: "importOpdsEntry",
                callProp: "importOpdsEntry",
            },
            {
                moduleId: "publication",
                methodId: "search",
                resultProp: "searchResult",
                buildRequestData,
                onLoad: true,
            },
        ],
        mapDispatchToProps,
    },
);
