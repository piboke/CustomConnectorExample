/// <reference path="./renderUiElements.ts" />

namespace blog.timelineConnector {
    export class timelineConnectorSample implements IRecordSource {
        private _context!: IConnectorContext;
        private _accountId: string = "";
        private _fetchXml: string = "";
        private _uiRenderer!: TimelineUIRenderer;
        //default name for the connector
        getRecordSourceInfo() {
            return { name: "Quote custom timeline connector" };
        }

        init(context: IConnectorContext, config?: JSON) {
            this._context = context;
            this._accountId = context.parameters.tableContext.id;
            this._fetchXml = this.prepareFetchXml();
            this._uiRenderer = new TimelineUIRenderer(context, this.getRecordSourceInfo().name);

            return Promise.resolve();
        }
        async getRecordsData(request: IRecordsDataRequest, filter?: IFilterRequest): Promise<IRecordsDataResponse> {
            var quotes = await this.fetchQuotes();

            return <IRecordsDataResponse>{
                requestId: request.requestId,
                records: quotes
            }
        }

        getRecordUX(recordData: IRecordData, request: IRecordUXRequest): IRecordUX {
            //here we'll create the component that will be displayed on the timeline
            const sortDateValue = recordData.sortDateValue || new Date().toISOString();
            const recordId = recordData.id;
            const isExpanded = request.isExpanded || false;
            
            return this._uiRenderer.buildRecordUX(sortDateValue, recordId, isExpanded, recordData.data);
        }
        //we won't touch those for a moment
        getRecordCreate?: (() => IRecordCreate[]) | undefined;
        getFilterDetails?: ((filter?: IFilterRequest) => Promise<IFilterGroup[]>) | undefined;

        private async fetchQuotes(): Promise<IRecordData[]> {
            try {
                const result = await Xrm.WebApi.retrieveMultipleRecords("quote", "?fetchXml=" + this._fetchXml);
                
                // Transform the raw data into IRecordData format
                return result.entities.map((entity: any) => ({
                    id: entity.quoteid,
                    sortDateValue: entity.createdon,
                    data: JSON.stringify({
                        name: entity.name,
                        totalamount: entity.totalamount,
                        statecode: entity.statecode,
                        customerid: entity.customerid
                    })
                } as IRecordData));
            } catch (error) {
                console.error("Error fetching quotes:", error);
                return []; // Return empty array on error
            }
        }
        private prepareFetchXml(): string {
            return `<fetch version="1.0" output-format="xml-platform" mapping="logical" no-lock="false" distinct="true">
                    <entity name="quote">
                        <attribute name="name" />
                        <order attribute="name" descending="false" />
                        <attribute name="statecode" />
                        <attribute name="totalamount" />
                        <attribute name="createdon" />
                        <attribute name="customerid" />
                        <attribute name="quoteid" />
                        <filter type="and">
                            <condition attribute="customerid" operator="eq"
                                value="${this._accountId}" 
                                uitype="account" />
                        </filter>
                    </entity>
                </fetch>`;
        }
    }
}