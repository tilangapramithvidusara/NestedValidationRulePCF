import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./src/App";

export class ValidationRules implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private container: HTMLDivElement;
    
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        this.container = container;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        ReactDOM.render(React.createElement(App), this.container);
    }

    // public getOutputs(): IOutputs
    // {
    //     return {};
    // }

    public destroy(): void
    {
    }
}
