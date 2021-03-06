// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { inject, injectable} from "inversify";

import { CatalogEntryView, CatalogView } from "readium-desktop/common/views/catalog";

import { Translator } from "readium-desktop/common/services/translator";

import { CatalogConfig } from "readium-desktop/main/db/document/config";

import { PublicationViewConverter } from "readium-desktop/main/converter/publication";

import { LocatorType } from "readium-desktop/common/models/locator";

import { ConfigRepository } from "readium-desktop/main/db/repository/config";
import { LocatorRepository } from "readium-desktop/main/db/repository/locator";
import { PublicationRepository } from "readium-desktop/main/db/repository/publication";

export const CATALOG_CONFIG_ID = "catalog";

@injectable()
export class CatalogApi {
    @inject("publication-repository")
    private publicationRepository: PublicationRepository;

    @inject("config-repository")
    private configRepository: ConfigRepository;

    @inject("locator-repository")
    private locatorRepository: LocatorRepository;

    @inject("publication-view-converter")
    private publicationViewConverter: PublicationViewConverter;

    @inject("translator")
    private translator: Translator;

    public async get(): Promise<CatalogView> {
        const __ = this.translator.translate.bind(this.translator);

        // Last added publications
        const lastAddedPublications = await this.publicationRepository.find({
            limit: 10,
            sort: [ { createdAt: "desc" } ],
        });
        const lastAddedPublicationViews = lastAddedPublications.map((doc) => {
            return this.publicationViewConverter.convertDocumentToView(doc);
        });

        // Last read publicatons
        const lastLocators = await this.locatorRepository.findBy(
            { locatorType: LocatorType.LastReadingLocation },
            {
                limit: 10,
                sort: [ { updatedAt: "desc" } ],
            },
        );
        const lastLocatorPublicationIdentifiers = lastLocators.map(
            (locator: any) => locator.publicationIdentifier,
        );
        const lastReadPublicationViews = [];

        for (const pubIdentifier of lastLocatorPublicationIdentifiers) {
            let pubDoc = null;

            try {
                pubDoc = await this.publicationRepository.get(pubIdentifier);
            } catch (error) {
                // Document not found
                continue;
            }

            lastReadPublicationViews.push(
                this.publicationViewConverter.convertDocumentToView(pubDoc),
            );
        }

        // Dynamic entries
        let entries: CatalogEntryView[] = [
            {
                title: __("catalog.entry.continueReading"),
                totalCount: lastReadPublicationViews.length,
                publications: lastReadPublicationViews,
            },
            {
                title: __("catalog.entry.lastAdditions"),
                totalCount: lastAddedPublicationViews.length,
                publications: lastAddedPublicationViews,
            },
        ];

        // Concat user entries
        const userEntries = await this.getEntries();
        entries = entries.concat(userEntries);

        return {
            entries,
        };
    }

    public async addEntry(data: any): Promise<CatalogEntryView[]> {
        const entryView = data.entry as CatalogEntryView;
        let entries: any = [];

        try {
            const config = await this.configRepository.get(CATALOG_CONFIG_ID);
            const catalog = config.value as CatalogConfig;
            entries = catalog.entries;
        } catch (error) {
            // New configuration
        }

        entries.push({
            title: entryView.title,
            tag: entryView.tag,
        });

        await this.configRepository.save({
            identifier: CATALOG_CONFIG_ID,
            value: { entries },
        });
        return this.getEntries();
    }

    /**
     * Returns entries without publications
     */
    public async getEntries(): Promise<CatalogEntryView[]> {
        let config = null;

        try {
            config = await this.configRepository.get(CATALOG_CONFIG_ID);
        } catch (error) {
            return [];
        }

        const catalog = config.value as CatalogConfig;
        const entryViews: CatalogEntryView[] = [];

        for (const entry of catalog.entries) {
            const publications = await this.publicationRepository.findByTag(entry.tag);
            const publicationViews = publications.map((doc) => {
                return this.publicationViewConverter.convertDocumentToView(doc);
            });
            entryViews.push(
                {
                    title: entry.title,
                    tag: entry.tag,
                    publications: publicationViews,
                    totalCount: publicationViews.length,
                },
            );
        }

        return entryViews;
    }

    public async updateEntries(data: any): Promise<CatalogEntryView[]> {
        const entryViews = data.entries as CatalogEntryView[];
        const entries = entryViews.map((view) => {
            return {
                title: view.title,
                tag: view.tag,
            };
        });
        const catalogConfig: CatalogConfig = {
            entries,
        };
        await this.configRepository.save({
            identifier: CATALOG_CONFIG_ID,
            value: catalogConfig,
        });
        return this.getEntries();
    }
}
