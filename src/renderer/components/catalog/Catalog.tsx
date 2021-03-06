// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as qs from "query-string";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { CatalogView} from "readium-desktop/common/views/catalog";

import LibraryLayout from "readium-desktop/renderer/components/layout/LibraryLayout";
import { withApi } from "readium-desktop/renderer/components/utils/api";
import { TranslatorProps } from "readium-desktop/renderer/components/utils/translator";
import Header, { DisplayType } from "./Header";

import GridView from "./GridView";
import ListView from "./ListView";

interface CatalogProps extends TranslatorProps, RouteComponentProps {
    catalog?: CatalogView;
    tags?: string[];
    requestCatalog: any;
}

export class Catalog extends React.Component<CatalogProps, undefined> {
    public render(): React.ReactElement<{}> {
        const { __ } = this.props;
        let DisplayView: any = GridView;
        let displayType = DisplayType.Grid;

        if (this.props.location) {
            const parsedResult = qs.parse(this.props.location.search);

            if (parsedResult.displayType === DisplayType.List) {
                DisplayView = ListView;
                displayType = DisplayType.List;
            }
        }

        const secondaryHeader = <Header displayType={ displayType } />;

        return (
            <LibraryLayout secondaryHeader={secondaryHeader} title={__("header.books")}>
                    { this.props.catalog &&
                        <DisplayView catalogEntries={ this.props.catalog.entries }
                        tags={this.props.tags}/>
                    }
            </LibraryLayout>
        );
    }
}

export default withApi(
    withRouter(Catalog),
    {
        operations: [
            {
                moduleId: "catalog",
                methodId: "get",
                callProp: "requestCatalog",
                resultProp: "catalog",
                onLoad: true,
            },
            {
                moduleId: "publication",
                methodId: "getAllTags",
                resultProp: "tags",
                onLoad: true,
            },
        ],
        refreshTriggers: [
            {
                moduleId: "publication",
                methodId: "import",
            },
            {
                moduleId: "publication",
                methodId: "importOpdsEntry",
            },
            {
                moduleId: "publication",
                methodId: "delete",
            },
            {
                moduleId: "catalog",
                methodId: "addEntry",
            },
            {
                moduleId: "publication",
                methodId: "updateTags",
            },
        ],
    },
);
