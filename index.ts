

/* eslint no-unused-vars : "off" */
/* eslint no-undef : "off" */
// eslint-disable-next-line no-debugger
debugger;
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import {} from 'googlemaps';
import { Loader } from "@googlemaps/js-api-loader";
import {Marker} from '@googlemaps/adv-markers-utils';
import {
    GoogleMap,
    MarkerF,
    useJsApiLoader,
  } from "@react-google-maps/api";
  
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ScreenLoader } from './ExtraComponents';
import { type } from "os";
import { google } from "google-maps";
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class GoogleMapPCFSubgridView implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _context: ComponentFramework.Context<IInputs>;
    private _containerforGlobal: HTMLDivElement;
    private GoogleMapsScriptSrc: string;
    private PushPincolor: string;
    private PushPinColorLead: string;
    private PushPinColorOpportunity: string;
    private PhysicallyViable: string;
    private ApproveCarnival: string;
    private ApproveCircus: string;
    private ApproveInflate: string;
    private ApproveOther: string; 
    private ApproveSmallEvent: string;    
    private GoogleMapsKey: string;
    private _MapIsLoaded: boolean;
    private IsLeadPresent: boolean;
    private IsOpportunityPresent: boolean;
    private MapView: string | null;
    private AllLocations: google.maps.LatLng[] = [];
    private AllPushPins: google.maps.Marker[] = [];
    private _InfoBox: google.maps.InfoWindow;
    private pointaddress: any;
    private map: google.maps.Map;
    private onClickSelf: any;
    private Flag: boolean = false;
    private AllCircles: google.maps.Circle[] = [];
    private circle: google.maps.Circle;
    private keepInfoBoxOpen: boolean = false;

    constructor() {}

    public async init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): Promise<void> {
        try {
            this._context = context;
            this._containerforGlobal = container;
            this.setupInfoBoxActions();
            this.GoogleMapsKey = context.parameters.GoogleMapsKey.raw ? context.parameters.GoogleMapsKey.raw : "";
            this.GoogleMapsScriptSrc = `https://maps.googleapis.com/maps/api/js?key=${this.GoogleMapsKey}&libraries=maps,geocoding,marker,drawing,core`;
            await this.addGoogleMapsScriptToHeader();
            ReactDOM.render(
                React.createElement(ScreenLoader),
                this._containerforGlobal
            );
            this.ShowLoader();

const style = document.createElement("style");
style.innerHTML = `

        .gm-style-iw-chr
        {
             height: 30px;
        }
`;
document.head.appendChild(style);

          
            

            //@ts-ignore
            Xrm.Utility.showProgressIndicator("Retrieving Maps and Location ...");
            setTimeout(
                function () {
                    //@ts-ignore
                    Xrm.Utility.closeProgressIndicator();
                },
                8000
            );
        }
        catch (error) { console.log(error); }
    }

    public async addGoogleMapsScriptToHeader(): Promise<void> {
        return new Promise<void>((resolve) => {
            let metatag1: HTMLMetaElement = document.createElement("meta");
            metatag1.httpEquiv = "cache-control";
            metatag1.content = "no-cache";
            this._containerforGlobal.appendChild(metatag1);
            let metatag2: HTMLMetaElement = document.createElement("meta");
            metatag2.httpEquiv = "expires";
            metatag2.content = "0";
            this._containerforGlobal.appendChild(metatag2);
            let metatag3: HTMLMetaElement = document.createElement("meta");
            metatag3.httpEquiv = "pragma";
            metatag3.content = "no-cache";
            this._containerforGlobal.appendChild(metatag3);
            let headerScript: HTMLScriptElement = document.createElement("script");
            headerScript.type = 'text/javascript';
            headerScript.id = "GoogleMapsHeaderScript";
            headerScript.async = false;
            headerScript.defer = true;
            headerScript.src = this.GoogleMapsScriptSrc;
            headerScript.onload = () => {
                this._MapIsLoaded = true; 
                if(this._MapIsLoaded == true)
                    resolve();
            };

            this._containerforGlobal.appendChild(headerScript);
        });
    }

    public loadGoogleMapTools(): void {
        try {
            const self = this;
    
            if (!this._MapIsLoaded) {
                console.log("Map is not loaded yet.");
                setTimeout(() => { self.loadGoogleMapTools(); }, 500);
                return;
            }
    
            if (!google.maps.Geocoder || !google.maps.DirectionsService) {
                console.log("Google Maps services are not yet available.");
                setTimeout(() => { self.loadGoogleMapTools(); }, 500);
                return;
            }
    
            this.Flag = true;
            console.log("Google Maps services loaded successfully.");
    
        } catch (error) {
            console.error("Error loading Google Maps tools:", error);
        }
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        try {
            this.ShowLoader();
            this._context = context;
            this.MapView = context.parameters.MapType.raw;
            this.GoogleMapsKey = context.parameters.GoogleMapsKey.raw ? context.parameters.GoogleMapsKey.raw : "";
            this.GoogleMapsScriptSrc = `https://maps.googleapis.com/maps/api/js?key=${this.GoogleMapsKey}&libraries=maps,geocoding,marker,drawing,core`;
           
            this._containerforGlobal.style.height = "100%";
            this._containerforGlobal.style.width = "100%";
            this.PushPinColorLead = context.parameters.OnOpenLeadColor.raw ? context.parameters.OnOpenLeadColor.raw : "rgba(255,0,0,0.8)";
            this.PushPincolor= context.parameters.NoOpenLeadOrOpportunityColor.raw ? context.parameters.NoOpenLeadOrOpportunityColor.raw : "rgba(11, 156, 49, 1)";
            this.PushPinColorOpportunity=context.parameters.OnOpenOpportunityColor.raw ? context.parameters.OnOpenOpportunityColor.raw : "rgba(255, 255, 0, 0.8)";
          
            this.ApproveSmallEvent=context.parameters.IsApprovedForSmallEventColor.raw ? context.parameters.IsApprovedForSmallEventColor.raw : "rgba(128,0,128,0.8)";  
            if (!this._context.parameters.DataSet.loading) {
                if (this._context.parameters.DataSet.paging.totalResultCount <= 0) { this._containerforGlobal.innerHTML = "<b style='color: black;'>Please wait while map is loaded !!</b>"; }
                if (this._context.parameters.DataSet.paging != null && this._context.parameters.DataSet.paging.hasNextPage == true) {
                    this._context.parameters.DataSet.paging.setPageSize(5000);
                    this._context.parameters.DataSet.paging.loadNextPage();
                }
                else {
                    var self = this;
                    if (this._MapIsLoaded == true) { this.StartDataRendering(); }
                    else { setTimeout(() => { self.updateView(this._context); }, 500); return; }
                }
            }
        }
        catch (error) { console.log(error); }   
     }

     public StartDataRendering(): void {
        try {
            this.ShowLoader();
            this.AllLocations = [];
            this.AllPushPins = [];
            this.AllCircles = [];
            let temparray: any = [];
            let radius = 10;
            let strokeColor = "";
            let strokeWidth = 0;
            let cntr = 0;
    
            let fillColorLeadopen = this.PushPinColorLead;
            let fillColorOpportunityopen = this.PushPinColorOpportunity;
            let fillColor = this.PushPincolor;
            let fillColorapprovesmallevent = this.ApproveSmallEvent;
    
            let svgLeadOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="${2 * radius}" height="${2 * radius}"><circle cx="${radius}" cy="${radius}" r="${radius - strokeWidth}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fillColorOpportunityopen}"/></svg>`;
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${2 * radius}" height="${2 * radius}"><circle cx="${radius}" cy="${radius}" r="${radius - strokeWidth}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fillColor}"/></svg>`;
            let svgOpportunityOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="${2 * radius}" height="${2 * radius}"><circle cx="${radius}" cy="${radius}" r="${radius - strokeWidth}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fillColorLeadopen}"/></svg>`;
            let svgapprovesmallevent = `<svg xmlns="http://www.w3.org/2000/svg" width="${2 * radius}" height="${2 * radius}"><circle cx="${radius}" cy="${radius}" r="${radius - strokeWidth}" stroke="${strokeColor}" stroke-width="${strokeWidth}" fill="${fillColorapprovesmallevent}"/></svg>`;
    
            console.log("Total " + this._context.parameters.DataSet.sortedRecordIds.length);
    
            let viewid = this._context.parameters.DataSet.getViewId();
            let viewname: any = null;
    
            // Fetch view name
            while (viewname == null && viewid != null) {
                var req = new XMLHttpRequest();
                //@ts-ignore
                req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.2/savedqueries(" + viewid + ")?$select=name", false);
                req.setRequestHeader("OData-MaxVersion", "4.0");
                req.setRequestHeader("OData-Version", "4.0");
                req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                req.setRequestHeader("Accept", "application/json");
                req.setRequestHeader("Prefer", "odata.include-annotations=*");
                req.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        req.onreadystatechange = null;
                        if (this.status === 200) {
                            var result = JSON.parse(this.response);
                            console.log(result);
                            var name = result["name"];
                            viewname = name;
                        } else {
                            console.log(this.responseText);
                        }
                    }
                };
                req.send();
            }
    
            for (let recordid of this._context.parameters.DataSet.sortedRecordIds) {
                var CurrentRecord = this._context.parameters.DataSet.records[recordid];
                if (CurrentRecord) {
                    let Latitude: any;
                    let Longitude: any;
                    let CountLead: any;
                    let CountOpportunity: any;
                    let IsPhysicallyViable: any;
                    let IsApprovedForCarnival: any;
                    let IsApprovedForCircus: any;
                    let IsApprovedForInflate: any;
                    let IsApprovedForOther: any;
                    let IsApprovedForSmallEvent: any;
    
                    this.IsLeadPresent = false;
                    this.IsOpportunityPresent = false;
    
                    // CountLead = parseInt(CurrentRecord.getFormattedValue("NumberOfOpenLeads") || "0");
                    // CountOpportunity = parseInt(CurrentRecord.getFormattedValue("NumberOfOpenOpportunities") || "0");
                    // IsPhysicallyViable = CurrentRecord.getFormattedValue("IsPhysicallyViable");
                    // IsApprovedForCarnival = CurrentRecord.getFormattedValue("IsApprovedForCarnival");
                    // IsApprovedForCircus = CurrentRecord.getFormattedValue("IsApprovedForCircus");
                    // IsApprovedForInflate = CurrentRecord.getFormattedValue("IsApprovedForInflate");
                    // IsApprovedForOther = CurrentRecord.getFormattedValue("IsApprovedForOther");
                    // IsApprovedForSmallEvent = CurrentRecord.getFormattedValue("IsApprovedForSmallEvent");

                    if (CurrentRecord.getFormattedValue("NumberOfOpenLeads") && CurrentRecord.getFormattedValue("NumberOfOpenLeads") != "") {
                        CountLead = parseInt(CurrentRecord.getFormattedValue("NumberOfOpenLeads"));
                    }
                    if (CurrentRecord.getFormattedValue("NumberOfOpenOpportunities") && CurrentRecord.getFormattedValue("NumberOfOpenOpportunities") != "") {
                        CountOpportunity = parseInt(CurrentRecord.getFormattedValue("NumberOfOpenOpportunities"));
                    }
                    if (CurrentRecord.getFormattedValue("IsPhysicallyViable") && CurrentRecord.getFormattedValue("IsPhysicallyViable") != "") {
                        IsPhysicallyViable = CurrentRecord.getFormattedValue("IsPhysicallyViable");
                    }
                    if (CurrentRecord.getFormattedValue("IsApprovedForCarnival") && CurrentRecord.getFormattedValue("IsApprovedForCarnival") != "") {
                        IsApprovedForCarnival = CurrentRecord.getFormattedValue("IsApprovedForCarnival");
                    }
                    if (CurrentRecord.getFormattedValue("IsApprovedForCircus") && CurrentRecord.getFormattedValue("IsApprovedForCircus") != "") {
                        IsApprovedForCircus = CurrentRecord.getFormattedValue("IsApprovedForCircus");
                    }
                    if (CurrentRecord.getFormattedValue("IsApprovedForInflate") && CurrentRecord.getFormattedValue("IsApprovedForInflate") != "") {
                        IsApprovedForInflate = CurrentRecord.getFormattedValue("IsApprovedForInflate");
                    }
                    if (CurrentRecord.getFormattedValue("IsApprovedForOther") && CurrentRecord.getFormattedValue("IsApprovedForOther") != "") {
                        IsApprovedForOther = CurrentRecord.getFormattedValue("IsApprovedForOther");
                    }
                    if (CurrentRecord.getFormattedValue("IsApprovedForSmallEvent") && CurrentRecord.getFormattedValue("IsApprovedForSmallEvent") != "") {
                        IsApprovedForSmallEvent = CurrentRecord.getFormattedValue("IsApprovedForSmallEvent");
                    }
    
    
                    // var compositeaddress = CurrentRecord.getFormattedValue("address1_composite");
                    // var recordName = CurrentRecord.getFormattedValue("Accountname");
    
                    // Latitude = parseFloat(CurrentRecord.getFormattedValue("address1_latitude") || "0");
                    // Longitude = parseFloat(CurrentRecord.getFormattedValue("address1_longitude") || "0");

                    var compositeaddress;
                    if (CurrentRecord.getFormattedValue("address1_composite") && CurrentRecord.getFormattedValue("address1_composite") != null) {
                        compositeaddress = CurrentRecord.getFormattedValue("address1_composite");
                    }
                    var recordName = CurrentRecord.getFormattedValue("Accountname");
    
                    if (CurrentRecord.getFormattedValue("address1_latitude") && CurrentRecord.getFormattedValue("address1_latitude") != "") {
                        Latitude = parseFloat(CurrentRecord.getFormattedValue("address1_latitude"));
                    }
                    if (CurrentRecord.getFormattedValue("address1_longitude") && CurrentRecord.getFormattedValue("address1_longitude") != "") {
                        Longitude = parseFloat(CurrentRecord.getFormattedValue("address1_longitude"));
                    }
    
    
                    // if (Latitude != 0 && Longitude != 0) {
                        if (Latitude != "" && Longitude != "") {
                        let Location = new google.maps.LatLng(Latitude, Longitude);
                        var locs = new google.maps.Circle({
                            strokeColor: "blue",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: 'rgba(0,0,0,0)',
                            fillOpacity: 0.35,
                            center: Location,
                            radius: 30000,
                            clickable: true,
                            map: this.map
                        });
    
                        this.AllLocations.push(Location);
    
                        if (CountLead > 0) {
                            this.IsLeadPresent = true;
                        }
    
                        if (CountOpportunity > 0) {
                            this.IsOpportunityPresent = true;
                        }
    
                        let PushPin: google.maps.Marker;
                        let icon: google.maps.Icon;
    
                        if (this.IsLeadPresent || this.IsOpportunityPresent) {
                            // Add the blue circle only when there is a Lead or Opportunity present
                            this.AllCircles.push(locs);
                            cntr++;
                        }
    
                        if (this.IsLeadPresent) {
                            icon = {
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgLeadOpen),
                                scaledSize: new google.maps.Size(20, 20)
                            };
                        } else if (this.IsOpportunityPresent) {
                            icon = {
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgOpportunityOpen),
                                scaledSize: new google.maps.Size(20, 20)
                            };
                        } else {
                            let svgToUse = svg;
                            if (viewname != null && viewname != "") {
                                if (viewname === "Physically Viable - Mall Locations (Google Maps View)") {
                                    if (IsPhysicallyViable != null && IsPhysicallyViable === "Don't Know") {
                                        svgToUse = svgapprovesmallevent;
                                    }
                                } else if (viewname === "Approved for Carnival - Mall Locations (Google Maps View)") {
                                    if (IsApprovedForCarnival != null && IsApprovedForCarnival === "Don't Know") {
                                        svgToUse = svgapprovesmallevent;
                                    }
                                } else if (viewname === "Approved for Circus - Mall Locations (Google Maps View)") {
                                    if (IsApprovedForCircus != null && IsApprovedForCircus === "Don't Know") {
                                        svgToUse = svgapprovesmallevent;
                                    }
                                } else if (viewname === "Approved for Inflate - Mall Locations (Google Maps View)") {
                                    if (IsApprovedForInflate != null && IsApprovedForInflate === "Don't Know") {
                                        svgToUse = svgapprovesmallevent;
                                    }
                                } else if (viewname === "Approved for Other - Mall Locations (Google Maps View)") {
                                    if (IsApprovedForOther != null && IsApprovedForOther === "Don't Know") {
                                        svgToUse = svgapprovesmallevent;
                                    }
                                }
                            }
                            icon = {
                                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgToUse),
                                scaledSize: new google.maps.Size(20, 20)
                            };
                        }
    
                        // PushPin = new google.maps.Marker({
                        //     position: Location,
                        //     icon: icon
                        // });

                        PushPin = new google.maps.Marker({
                        position: Location,
                        icon: {
                            ...icon,
                            anchor: new google.maps.Point(10, 10),
                            labelOrigin: new google.maps.Point(10, -10)
                        }
                    });
                        PushPin.set('metadata', {
                            RecordId: recordid,
                            RecordName: recordName,
                            RecordAddress: compositeaddress,
                            IsPhysicallyViable: IsPhysicallyViable,
                            IsApprovedForCarnival: IsApprovedForCarnival,
                            IsApprovedForCircus: IsApprovedForCircus,
                            IsApprovedForInflate: IsApprovedForInflate,
                            IsApprovedForOther: IsApprovedForOther,
                            IsApprovedForSmallEvent: IsApprovedForSmallEvent
                        });
    
                        this.AllPushPins.push(PushPin);
                    }
                }
            }
    
            this.StartMapRendering();
        }
        catch (error) {
            console.log(error);
        }
    }

    public StartMapRendering(): void {
        try {
            if (this.AllLocations.length > 0) {
                const mapOptions: google.maps.MapOptions = {
                    zoom: 8
                };
    
                this.map = new google.maps.Map(this._containerforGlobal, mapOptions);
    
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < this.AllLocations.length; i++) {
                    bounds.extend(this.AllLocations[i]);
                }
                this.map.fitBounds(bounds);
    
                if (this.MapView == "Roadview") { 
                    this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP); 
                }
    
                this.map.addListener("rightclick", (e: google.maps.MapMouseEvent) => this.GetAddressOfPushpin(e));
    
                // for (var k = 0; k < this.AllPushPins.length; k++) {
                //     const pushPin = this.AllPushPins[k];
                //     pushPin.setMap(this.map);
                //     pushPin.addListener("mouseover", (e) => this.DisplayInfoBox(pushPin, e));
                //     pushPin.addListener("mouseout", () => this.HideInfoBox());
                //   }
                for (var k = 0; k < this.AllPushPins.length; k++) {
                    const pushPin = this.AllPushPins[k];
                    pushPin.setMap(this.map);
                    pushPin.addListener("mouseover", (e) => {
                      this.keepInfoBoxOpen = true;
                      this.DisplayInfoBox(pushPin, e);
                    });
                    pushPin.addListener("mouseout", () => {
                      this.keepInfoBoxOpen = false;
                      this.HideInfoBox();
                    });
                  }
              
    
                // for (var j = 0; j < this.AllCircles.length; j++) {
                //     this.AllCircles[j].setMap(this.map);
                // }
                for (var j = 0; j < this.AllCircles.length; j++) {
                    this.AllCircles[j].setMap(this.map);
                    google.maps.event.addListener(this.AllCircles[j], 'rightclick', (e: google.maps.MapMouseEvent) => this.GetAddressOfPushpin(e));
                }
    
                this._InfoBox = new google.maps.InfoWindow({
                    position: this.map.getCenter(),
                    content: ''
                });
    
                this.HideLoader();
            } else {
                this.map = new google.maps.Map(this._containerforGlobal, {
                    center: { lat: 0, lng: 0 },
                    zoom: 2
                });
    
                if (this.MapView == "Roadview") { 
                    this.map.setMapTypeId(google.maps.MapTypeId.ROADMAP); 
                }
    
                this._InfoBox = new google.maps.InfoWindow({
                    position: this.map.getCenter(),
                    content: ''
                });
    
                this.HideLoader();
            }
        } catch (error) { 
            console.log(error); 
        }
    }

    public GetAddressOfPushpin(e: google.maps.MapMouseEvent): void {
        console.log("Right-click event triggered");
        if (e.latLng) {
            this.reverseGeocoding(e.latLng.lat(), e.latLng.lng());
        }
    }

   
    public reverseGeocoding(lat: number, lng: number): void {
        const geocoder = new google.maps.Geocoder();
        const latlng = { lat, lng };

        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                this._InfoBox.setOptions({
                    position: new google.maps.LatLng(lat, lng),
                    content: this.createInfoBoxContent(results[0].formatted_address, true)
                });
                this._InfoBox.open(this.map);
            } else {
                alert("Unable to reverse geocode location.");
            }
        });
    }

    // public DisplayInfoBox(marker: google.maps.Marker, event: google.maps.MapMouseEvent): void {
    //     try {
    //       console.log("DisplayInfoBox called", marker);
      
    //       if (!marker) {
    //         console.error("Marker is undefined");
    //         return;
    //       }
      
    //       const position = marker.getPosition();
    //       if (!position) {
    //         console.error("Marker position is undefined");
    //         return;
    //       }
      
    //       const metadata = marker.get('metadata');
    //       if (!metadata) {
    //         console.error("Marker metadata is undefined");
    //         return;
    //       }
      
    //       const content = this.createInfoBoxContent(metadata.RecordName, false, metadata);
      
    //       this._InfoBox.setOptions({
    //         position: position,
    //         content: content
    //       });
    //       this._InfoBox.open(this.map, marker);
    //     } catch (error) {
    //       console.error("Error in DisplayInfoBox:", error);
    //     }
    //   }
    public DisplayInfoBox(marker: google.maps.Marker, event: google.maps.MapMouseEvent): void {
        try {
          console.log("DisplayInfoBox called", marker);
      
          if (!marker) {
            console.error("Marker is undefined");
            return;
          }
      
          const position = marker.getPosition();
          if (!position) {
            console.error("Marker position is undefined");
            return;
          }
      
          const metadata = marker.get('metadata');
          if (!metadata) {
            console.error("Marker metadata is undefined");
            return;
          }
      
          const content = this.createInfoBoxContent(metadata.RecordName, false, metadata);
      
          this._InfoBox.setOptions({
            position: position,
            content: content
          });
          this._InfoBox.open(this.map, marker);
      
          // Add event listeners to the InfoBox
          google.maps.event.addListener(this._InfoBox, 'domready', () => {
            const infoBoxDiv = document.querySelector('.gm-style-iw-c') as HTMLElement;
            if (infoBoxDiv) {
              infoBoxDiv.addEventListener('mouseover', () => {
                this.keepInfoBoxOpen = true;
              });
              infoBoxDiv.addEventListener('mouseout', () => {
                this.keepInfoBoxOpen = false;
                this.HideInfoBox();
              });
            }
          });
      
        } catch (error) {
          console.error("Error in DisplayInfoBox:", error);
        }
      }

   private createInfoBoxContent(title: string, isReverseGeocode: boolean, metadata?: any): string {
    let content = `
    <div style="font-family: Arial, sans-serif; padding: 10px;">
      <h3 style="margin-top: 0; margin-bottom: 10px;">${title}</h3>

      </div>
  `;
  
  if (isReverseGeocode) {
    content += `<p style=" margin-left: 10px; margin-bottom: 10px;">This is the location for the chosen coordinates</p>`;
  } else if (metadata) {
    content += `
      <p style=" margin-left: 10px; margin-bottom: 10px;"><strong>Address:</strong> ${metadata.RecordAddress}</p>
    `;
  }

  content += `
    <div id="infoBoxActions" style=" margin-left: 15px;margin-bottom: 15px; margin-top: 15px">
      ${isReverseGeocode ? 
        `<button onclick="window.openAccount()" style="margin-right: 10px;">Create Account</button>
         <button onclick="window.createLead()">Create Lead</button>` :
        `<button onclick="window.openAccount('${metadata?.RecordId}')" style="margin-right: 10px;">Open Account</button>
         <button onclick="window.createLead()">Create Lead Record</button>`
      }
    </div>
  </div>
  `;

  return content;

  }
    
    private setupInfoBoxActions(): void {
        // @ts-ignore
        window.openAccount = (id?: string) => {
            // @ts-ignore
            const url: string = Xrm.Utility.getGlobalContext().getCurrentAppUrl();
            const substr: string = url + "&pagetype=entityrecord&etn=account" + (id ? `&id=${id}` : "");
            window.open(substr, "_blank");
        };
    
        // @ts-ignore
        window.createLead = () => {
            // @ts-ignore
            const url: string = Xrm.Utility.getGlobalContext().getCurrentAppUrl();
            const substr: string = url + "&pagetype=entityrecord&etn=lead";
            window.open(substr, "_blank");
        };
    }
    
    // private HideInfoBox(): void { 
    //     this._InfoBox.close(); 
    // }
    private HideInfoBox(): void {
        if (!this.keepInfoBoxOpen) {
          setTimeout(() => {
            if (!this.keepInfoBoxOpen) {
              this._InfoBox.close();
            }
          }, 100);
        }
      }

    public ShowLoader(): void {
        let Spinner = document.getElementById("LoaderDomForSubgridMap");
        if (Spinner) { Spinner.hidden = false; }
    }

    public HideLoader(): void {
        let Spinner = document.getElementById("LoaderDomForSubgridMap");
        setTimeout(() => {
            if (Spinner) { 
                Spinner.hidden = true;
                //@ts-ignore
                if (this._context && this._context.navigation && this._context.navigation._customControlProperties && this._context.navigation._customControlProperties.contextString == "subgrid"){
                    if(document.getElementsByClassName("MicrosoftMap").length > 0){
                        var gridContainer = document.getElementsByClassName("MicrosoftMap")[0].parentElement?.parentElement;
                        if(gridContainer != null && !gridContainer.style.height){
                            gridContainer.style.height = "500px";
                        }
                    }
                }
            }
        }, 500);
    }

   
   

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._containerforGlobal);
    }
}