// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import "reflect-metadata";

import * as fs from "fs";
import * as path from "path";

import { app } from "electron";
import { Store } from "redux";

import { Container } from "inversify";

import { Server } from "@r2-streamer-js/http/server";

import { Translator } from "readium-desktop/common/services/translator";
import { CatalogService } from "readium-desktop/main/services/catalog";
import { Downloader } from "readium-desktop/main/services/downloader";
import { WinRegistry } from "readium-desktop/main/services/win-registry";

import { DeviceIdManager } from "readium-desktop/main/services/device";
import { LcpManager } from "readium-desktop/main/services/lcp";

import { ActionSerializer } from "readium-desktop/common/services/serializer";

import { initStore } from "readium-desktop/main/redux/store/memory";
import { streamer } from "readium-desktop/main/streamer";

import { ConfigRepository } from "readium-desktop/main/db/repository/config";
import { LcpSecretRepository } from "readium-desktop/main/db/repository/lcp-secret";
import { LocatorRepository } from "readium-desktop/main/db/repository/locator";
import { OpdsFeedRepository } from "readium-desktop/main/db/repository/opds";
import { PublicationRepository } from "readium-desktop/main/db/repository/publication";

import { LocatorViewConverter } from "readium-desktop/main/converter/locator";
import { OpdsFeedViewConverter } from "readium-desktop/main/converter/opds";
import { PublicationViewConverter } from "readium-desktop/main/converter/publication";

import { CatalogApi } from "readium-desktop/main/api/catalog";
import { LcpApi } from "readium-desktop/main/api/lcp";
import { OpdsApi } from "readium-desktop/main/api/opds";
import { PublicationApi } from "readium-desktop/main/api/publication";

import {
    PublicationStorage,
} from "readium-desktop/main/storage/publication-storage";

import * as PouchDBCore from "pouchdb-core";

import {
    _NODE_ENV,
    _POUCHDB_ADAPTER_NAME,
    // _POUCHDB_ADAPTER_PACKAGE,
} from "readium-desktop/preprocessor-directives";
import { ReaderApi } from "./api/reader";
declare const __POUCHDB_ADAPTER_PACKAGE__: string;

// Create container used for dependency injection
const container = new Container();

// Check that user data directory is created
const userDataPath = app.getPath("userData");

if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath);
}

// Create databases
let PouchDB = (PouchDBCore as any);
// object ready to use (no "default" property) when:
// module.exports = PouchDB$2
// in the CommonJS require'd "pouchdb-core" package ("main" field in package.json)
// otherwise ("default" property) then it means:
// export default PouchDB$2
// in the native ECMAScript module ("jsnext:main" or "module" field in package.json)
if (PouchDB.default) {
    PouchDB = PouchDB.default;
}
// ==> this way, with process.env.NODE_ENV === DEV we can have "pouchdb-core" as an external,
// otherwise it gets bundled and the code continues to work in production.

const rootDbPath = path.join(
    userDataPath,
    (_NODE_ENV === "development") ? "db-dev" : "db",
);

if (!fs.existsSync(rootDbPath)) {
    fs.mkdirSync(rootDbPath);
}

// tslint:disable-next-line:no-var-requires
const pouchDbAdapter = require(__POUCHDB_ADAPTER_PACKAGE__);

// tslint:disable-next-line:no-var-requires
const pouchDbFind = require("pouchdb-find");

// tslint:disable-next-line:no-var-requires
const pouchDbSearch = require("pouchdb-quick-search");

// Load PouchDB plugins
PouchDB.plugin(pouchDbAdapter.default ? pouchDbAdapter.default : pouchDbAdapter);
PouchDB.plugin(pouchDbFind.default ? pouchDbFind.default : pouchDbFind);
PouchDB.plugin(pouchDbSearch.default ? pouchDbSearch.default : pouchDbSearch);

const dbOpts = {
    adapter: _POUCHDB_ADAPTER_NAME,
};

// Publication db
const publicationDb = new PouchDB(
    path.join(rootDbPath, "publication"),
    dbOpts,
);
const publicationRepository = new PublicationRepository(publicationDb);

// OPDS db
const opdsDb = new PouchDB(
    path.join(rootDbPath, "opds"),
    dbOpts,
);
const opdsFeedRepository = new OpdsFeedRepository(opdsDb);

// Config db
const configDb = new PouchDB(
    path.join(rootDbPath, "config"),
    dbOpts,
);
const configRepository = new ConfigRepository(configDb);

// Locator db
const locatorDb = new PouchDB(
    path.join(rootDbPath, "locator"),
    dbOpts,
);
const locatorRepository = new LocatorRepository(locatorDb);

// Lcp secret db
const lcpSecretDb = new PouchDB(
    path.join(rootDbPath, "lcp-secret"),
    dbOpts,
);
const lcpSecretRepository = new LcpSecretRepository(lcpSecretDb);

// Create filesystem storage for publications
const publicationRepositoryPath = path.join(
    userDataPath,
    "publications",
);

if (!fs.existsSync(publicationRepositoryPath)) {
    fs.mkdirSync(publicationRepositoryPath);
}

// Create store
const store = initStore();
container.bind<Store<any>>("store").toConstantValue(store);

// Create window registry
container.bind<WinRegistry>("win-registry").to(WinRegistry).inSingletonScope();

// Create translator
container.bind<Translator>("translator").to(Translator).inSingletonScope();

// Create downloader
const downloader = new Downloader(app.getPath("temp"));
container.bind<Downloader>("downloader").toConstantValue(downloader);

// Create repositories
container.bind<PublicationRepository>("publication-repository").toConstantValue(
    publicationRepository,
);
container.bind<OpdsFeedRepository>("opds-feed-repository").toConstantValue(
    opdsFeedRepository,
);
container.bind<LocatorRepository>("locator-repository").toConstantValue(
    locatorRepository,
);
container.bind<ConfigRepository>("config-repository").toConstantValue(
    configRepository,
);
container.bind<LcpSecretRepository>("lcp-secret-repository").toConstantValue(
    lcpSecretRepository,
);

// Create converters
container.bind<PublicationViewConverter>("publication-view-converter").to(PublicationViewConverter).inSingletonScope();
container.bind<LocatorViewConverter>("locator-view-converter").to(LocatorViewConverter).inSingletonScope();
container.bind<OpdsFeedViewConverter>("opds-feed-view-converter").to(OpdsFeedViewConverter).inSingletonScope();

// Storage
const publicationStorage = new PublicationStorage(publicationRepositoryPath);
container.bind<PublicationStorage>("publication-storage").toConstantValue(
    publicationStorage,
);

// Bind services
container.bind<Server>("streamer").toConstantValue(streamer);

const deviceIdManager = new DeviceIdManager("Thorium", configRepository);
container.bind<DeviceIdManager>("device-id-manager").toConstantValue(
    deviceIdManager,
);

// Create lcp manager
container.bind<LcpManager>("lcp-manager").to(LcpManager).inSingletonScope();
container.bind<CatalogService>("catalog-service").to(CatalogService).inSingletonScope();

// API
container.bind<CatalogApi>("catalog-api").to(CatalogApi).inSingletonScope();
container.bind<PublicationApi>("publication-api").to(PublicationApi).inSingletonScope();
container.bind<OpdsApi>("opds-api").to(OpdsApi).inSingletonScope();
container.bind<LcpApi>("lcp-api").to(LcpApi).inSingletonScope();
container.bind<ReaderApi>("reader-api").to(ReaderApi).inSingletonScope();

// Create action serializer
container.bind<ActionSerializer>("action-serializer").to(ActionSerializer).inSingletonScope();

export {
    container,
};
