// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as React from "react";

import { CatalogEntryView } from "readium-desktop/common/views/catalog";

import CatalogMenu from "readium-desktop/renderer/components/publication/menu/CatalogMenu";
import PublicationListElement from "readium-desktop/renderer/components/publication/PublicationListElement";

import NoPublicationInfo from "./NoPublicationInfo";

import * as styles from "readium-desktop/renderer/assets/styles/myBooks.css";

interface ListViewProps {
    catalogEntries: CatalogEntryView[];
    tags?: string[];
}

export default class ListView extends React.Component<ListViewProps, undefined> {

    public render(): React.ReactElement<{}> {
        const entriesEmpty = this.props.catalogEntries.filter((entry) => entry.publications.length > 0).length === 0;
        return (
            <>
            {
                this.props.catalogEntries.map((entry, entryIndex: number) => {
                    return entry.publications.length > 0 ? (
                        <section key={ entryIndex }>
                        {
                            entryIndex <= 1 ? (
                                <div className={styles.title}>
                                    <h2>{ entry.title }</h2>
                                </div>
                            ) :
                            (<></>)
                        }
                        {
                            entryIndex <= 1 ? (
                                <ul>
                                    { entry.publications.map((pub, i: number) => {
                                        return (
                                            <li className={styles.block_book_list} key={ i }>
                                                <PublicationListElement
                                                    publication={pub}
                                                    menuContent={<CatalogMenu publication={pub}/>}
                                                />
                                            </li>
                                        );
                                    })
                                    }
                                </ul>
                            ) :
                            (<></>)
                        }
                        </section>
                    ) : <></>;
            })
            }
            { entriesEmpty &&
                <NoPublicationInfo />
            }
            </>
        );
    }

}
