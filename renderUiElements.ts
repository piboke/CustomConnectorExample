namespace blog.timelineConnector {
    export class TimelineUIRenderer {
        private _context: IConnectorContext;
        private svgIconSrcPath: string = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTRDMTEuMzEzNyAxNCAzLjk5OTk5IDEwLjY4NjMgNCA4QzQgNS4zMTM3MSA3LjMxMzcxIDggOEM4IDEwLjY4NjMgMTEuMzEzNyAxNCA4IDE0WiIgZmlsbD0iIzEwNzFENyIvPgo8L3N2Zz4K";
        private _moduleName: string = "";

        constructor(context: IConnectorContext, moduleName: string) {
            this._context = context;
            this._moduleName = moduleName;
        }

        buildRecordUX(sortDateValue: string, recordId: string, isExpanded: boolean, recordData?: any): any {
        const commandComponents = this.createCommands();
        const headerComponents = [this.createHeaderComponent(recordId, isExpanded, recordData)];
        const bodyComponents = [this.createBodyComponent(recordId, isExpanded, recordData)];
        const footerComponents = [this.createFooterComponent(recordId, sortDateValue)];
        const icon = this.createIcon();
        // example of use custom icon component
        const bubbleIcon = recordId.includes("D365") && this.createIconComponent(recordId);
        const headerIcon = recordId.includes("D365") && this.createIconComponent(recordId);
       
        const timelineRecord = {
            id: recordId,
            commands: commandComponents,
            moduleName: this._moduleName,
            header: { components: headerComponents },
            body: { components: bodyComponents },
            footer: { components: footerComponents },
            accessibleName: "Quote Record: " + recordId,
            sortDateValue,
            icon,
            bubbleIcon,
            headerIcon,
        };
        return timelineRecord;
    }

    createCommands() {
        return [
            {
                iconType: 203,
                label: "Command Label: Visit Microsoft Support",
                command: "VisitSMC",
                commandType: "HYPERLINK",
                href: "https://support.microsoft.com",
            },
        ];
    }

    createIcon() {
        return {
            type: 205,
            accessibleName: "Quote icon accessibleName",
        };
    }

    createIconComponent(recordId: string) {
        const imgProps = {
            id: recordId,
            source: this.svgIconSrcPath,
            style: {},
        };
        return this._context.factory.createElement("IMG", imgProps);
    }

    createHeaderComponent(recordId: string, isExpanded: boolean, recordData ?: any) {
        let headerText = "Quote: " + recordId;

        if (recordData) {
            try {
                const data = JSON.parse(recordData);
                headerText = data.name || headerText;
            } catch (e) {
                // If data parsing fails, use default text
            }
        }

        return this._context.factory.createElement("Label", {
            key: "Quote_" + recordId + "_header",
        }, headerText + (isExpanded ? " (Expanded)" : " (Collapsed)"));
    }

    createBodyComponent(recordId: string, isExpanded: boolean, recordData ?: any) {
        let bodyText = "Quote details for: " + recordId;

        if (recordData && isExpanded) {
            try {
                const data = JSON.parse(recordData);
                bodyText = `Total Amount: ${data.totalamount || 'N/A'} | State: ${data.statecode || 'N/A'}`;
            } catch (e) {
                // If data parsing fails, use default text
            }
        }

        return this._context.factory.createElement("Label", {
            key: "Quote_" + recordId + "body",
        }, bodyText);
    }

    createFooterComponent(recordId: string, sortDateValue: string) {
        return this._context.factory.createElement("Label", {
            key: "Quote_" + recordId + "footer",
        }, "Footer Field: " + recordId + ". Sort date value: " + sortDateValue);
    }
}
}
