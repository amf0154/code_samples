import { Pipe, PipeTransform } from "@angular/core";
import { Enums } from "@endpoints/enums";
import { isBoolean, isNumber, isString } from "lodash";

@Pipe({ name: "widgetTypeToString" })
export class WidgetTypeToString implements PipeTransform {
    public transform(input: string, ...params: any[]): string {
        let widgetTypeStr = "";
        let plural = false;

        if (params.length > 0) {
            const pluralObj = params[0];
            if (pluralObj) {
                if (isString(pluralObj)) {
                    plural = pluralObj.toLowerCase() === "true";
                } else if (isBoolean(pluralObj)) {
                    plural = pluralObj;
                } else {
                    plural = pluralObj.toString() === "true";
                }
            }
        }

        if (input) {
            let widgetType: Enums.WidgetType = null;

            if (isString(input)) {
                widgetType = parseInt(input, 10) as Enums.WidgetType;
            } else if (isNumber(input)) {
                widgetType = input as Enums.WidgetType;
            }

            if (widgetType != null) {
                switch (widgetType) {
                    case Enums.WidgetType.Checklist:
                        widgetTypeStr = "Checklist";
                        break;
                    case Enums.WidgetType.Tasks:
                        widgetTypeStr = "Tasks";
                        break;
                    case Enums.WidgetType.Editor:
                        widgetTypeStr = "Text";
                        break;
                    case Enums.WidgetType.Image:
                        widgetTypeStr = "Image";
                        break;
                    case Enums.WidgetType.Video:
                        widgetTypeStr = "Video";
                        break;
                    case Enums.WidgetType.Document:
                        widgetTypeStr = "Document";
                        break;
                    case Enums.WidgetType.Link:
                        widgetTypeStr = "Link";
                        break;
                    case Enums.WidgetType.JobClarity:
                        widgetTypeStr = "Job Clarity";
                        break;
                    case Enums.WidgetType.Mentors:
                        widgetTypeStr = "Mentors";
                        break;
                }

                if (plural) {
                    widgetTypeStr += "s";
                }
            }
        }

        return widgetTypeStr;
    }
}
