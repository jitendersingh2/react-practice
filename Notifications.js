import "core-js/es6/map";
import "core-js/es6/set";
import React, { Component } from "react";
import {
  ICON_PHONE,
  ICON_EMAIL,
  ICON_ALERT_ORANGE,
  ICON_PLUS_SMALL,
  ICON_MINUS_SMALL,
  EDIT_WHITE,
  CLOSE_DELETE_WHITE,
  HISTORY_WHITE,
  ICON_COPY_WHITE
} from "../assets";
import axios from "axios";
import config from "../config";
import { Link } from "react-router-dom";
import utility from "../userService";
import _ from "lodash";

import ViewSituationReport from "./situationReport/viewSituationReport";
import ImageUploadView from "./imageUpload/imageUploadView";
import PropTypes from "prop-types";
import { dateConversationViewSave } from "../services/common.services";

export class Notification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      outageView: [],
      locations: [],
      tickets: [],
      internalTickets: [],
      externalTickets: [],
      comments: [],
      trafficAffected: [],
      loading: true,
      equipments: {},
      sitrep: {},
      attachments: [],
      images: [],
      isAdminPrivilege: false
    };
    this.onHandleloading = this.onHandleloading.bind(this);
  }

  onHandleloading(value) {
    if (this.props.handleloading) {
      this.props.handleloading(value);
    }
  }
  componentDidMount() {
    if (this.props.onClickMyNotification) {
      this.props.onClickMyNotification();
    }
    const flash = this.props.flash.flash;
    var user = utility.getUserContext();
    axios.get(config.urls.ENV + "flashes/" + flash + "?userId=" + user.vzId + "&q=" + Math.random()).then(res => {
      const ViewData = res.data;
      if (ViewData.tickets !== undefined) {
        var internalTickets = ViewData.tickets.filter(ticket => ticket.ticketType === "Internal");
        var externalTickets = ViewData.tickets.filter(ticket => ticket.ticketType === "External");
      }
      // console.log("ViewData.attachments",ViewData.attachments);
      this.onHandleloading(false);
      this.setState({
        loading: false,
        equipments: ViewData.equipments,
        outageView: ViewData,
        comments: ViewData.comments,
        locations: ViewData.locations,
        tickets: ViewData.tickets,
        sitrep: ViewData.sitrep,
        attachments: ViewData.attachments,
        internalTickets,
        externalTickets,
        networkEventTimeZoneJavaId: ViewData.networkEventTimeZoneJavaId,
        images: ViewData.images
      });
      if (ViewData.trafficAffected !== undefined) {
        this.setState({ trafficAffected: ViewData.trafficAffected });
      }
      if (ViewData.reportingOrg !== undefined) {
        let user = utility.getUserContext();
        axios.get(config.urls.ENV + "users/" + user.vzId).then(res => {
          const orgList = res.data.organizations;
          this.setState({ organisationsList: orgList,  reportingOrg: ViewData.reportingOrg}, () => this.checkOrgAdmin());
        });
      }
    });
  }

  checkOrgAdmin() {
    // eslint-disable-next-line
    this.state.organisationsList.map(org => {
      if (org.name === this.state.reportingOrg) {
        if (org.admin === true && org.adminPendingApproval === false) {
          this.setState({ isAdminPrivilege: true });
        }
      }
    });
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }
  renderEquipmentPanel(equipments) {
    var full_dom = [];
    for (var key in equipments) {
      ///Each EQUIPMENT ITEM -- START
      if (equipments.hasOwnProperty(key)) {
        // console.log(key);//Table TOP e.g FIOS
        var equip_details = equipments[key];
        if (equip_details.length > 0) {
          var row_count = 0;
          var span_count = 0;
          //var headers = "<thead><tr><td>"+key +"</td></tr><tr>";
          var headers = [];
          var table_body = [];
          //Each ROW START
          for (var i = 0; i < equip_details.length; i++) {
            var line_item = equip_details[i];
            //console.log("--------" + row_count + "--------------");
            //console.log(line_item);
            //table_body = "<tr>";
            var row_data = [];
            for (var kx in line_item) {
              if (line_item.hasOwnProperty(kx)) {
                if (row_count === 0) {
                  headers.push(<td style={{ background: "silver" }}>{kx}</td>);
                  span_count++;
                }
                row_data.push(<td>{line_item[kx]}</td>);
                //console.log(kx + " -- " + line_item[kx]); //TABLE ROWS
                span_count++;
              }
            }
            table_body.push(<tr>{row_data}</tr>);
            row_data = [];
            row_count++;
          }
          //EACH ROW END

          //console.log(headers);
          // console.log(<table><thead><tr><td colspan={span_count}>{key}</td></tr><tr>{headers}</tr></thead><tbody>{table_body}</tbody></table>);
          full_dom.push(
            <table className="table table-striped">
              <thead>
                <tr>
                  <td style={{ background: "#555555", color: "white" }} colSpan={span_count}>
                    {key}
                  </td>
                </tr>
                <tr>{headers}</tr>
              </thead>
              <tbody>{table_body}</tbody>
            </table>
          );
          //return [];
        }
      }
      ///EACH EQUIPMENT ITEM -- END
    }
    return <div>{full_dom}</div>;
  }

  renderTrafficAffected(traffic) {
    var rows = [];
    for (var key in traffic) {
      if (traffic.hasOwnProperty(key)) {
        if (traffic[key] instanceof Object) {
          var obj1 = traffic[key];

          for (var k1 in obj1) {
            if (!(obj1.hasOwnProperty(k1) && obj1[k1] instanceof Object)) {
              rows.push(
                <tr>
                  <td key={key}>
                    {key}.{k1}
                  </td>
                  <td>{obj1[k1]}</td>
                </tr>
              );
            } else {
              if (obj1[k1] instanceof Object) {
                var obj2 = obj1[k1];
                for (var k2 in obj2) {
                  if (!(obj2.hasOwnProperty(k2) && obj2[k2] instanceof Object)) {
                    rows.push(
                      <tr>
                        <td>
                          {key}.{k1}.{k2}
                        </td>
                        <td>{obj2[k2]}</td>
                      </tr>
                    );
                  }
                }
              }
            }
          }
        } else
          rows.push(
            <tr key="traffic">
              <td>{_.startCase(key)}</td>
              <td>{traffic[key]}</td>
            </tr>
          );
      }
    }
    return <tbody>{rows}</tbody>;
  }

  render() {
    const show = this.state.outageView.flashNumber === "Final Verified" ? "true" : this.props.show;
    const outage = this.state.outageView;
    const { flash } = this.props.flash;
    const traffic = this.state.trafficAffected;
    const equipments = this.state.equipments;
    const outageStartDate = dateConversationViewSave(
      "GMT",
      this.state.networkEventTimeZoneJavaId,
      outage.outageStartDate,
      "YYYY-MM-DD HH:mm:ss"
    );
    const reportedDateTime = dateConversationViewSave(
      "GMT",
      this.state.networkEventTimeZoneJavaId,
      outage.reportedDateTime,
      "YYYY-MM-DD HH:mm:ss"
    );
    const outageEndDate = dateConversationViewSave(
      "GMT",
      this.state.networkEventTimeZoneJavaId,
      outage.outageEndDate,
      "YYYY-MM-DD HH:mm:ss"
    );
    const outageClosedDate = dateConversationViewSave(
      "GMT",
      this.state.networkEventTimeZoneJavaId,
      outage.outageClosedDate,
      "YYYY-MM-DD HH:mm:ss"
    );
    const fccReportMet = dateConversationViewSave(
      "GMT",
      this.state.networkEventTimeZoneJavaId,
      outage.fccReportMet,
      "YYYY-MM-DD HH:mm:ss"
    );
    const criteriaMetDate = dateConversationViewSave(
      "GMT",
      this.state.networkEventTimeZoneJavaId,
      outage.criteriaMetDate,
      "YYYY-MM-DD HH:mm:ss"
    );
    return (
      <div>
        <div className={show ? "container-fluid" : "container-fluid pb-5"}>
          <div className="sticky-bottom-action">
            <ul className="float-right">
              <li>
                {this.state.outageView.flashStatus === "Final Verified" || show ? (
                  this.state.isAdminPrivilege === true ? (
                    <Link to={"/echo/edit/" + outage.flashNumber}>
                      <img alt="" src={EDIT_WHITE} height="24" /> EditClose Notification
                    </Link>
                  ) : (
                    ""
                  )
                ) : (
                  <Link to={"/echo/edit/" + outage.flashNumber}>
                    <img alt="" src={EDIT_WHITE} height="24" /> Edit Notification
                  </Link>
                )}
              </li>
              <li>
                {this.state.outageView.flashStatus !== "Final Verified" ? (
                  ""
                ) : (
                  <Link to={"/echo/cloneNotification/" + outage.flashNumber + "/clone"}>
                    <img alt="" src={ICON_COPY_WHITE} height="24" /> Clone Notification
                  </Link>
                )}
              </li>
              <li>
                {this.state.outageView.flashStatus === "Final Verified" || show ? (
                  ""
                ) : (
                  <Link to={"/echo/close/" + outage.flashNumber}>
                    <img alt="" src={CLOSE_DELETE_WHITE} height="24" /> Close Notification
                  </Link>
                )}
              </li>
              <li>
                <Link to={"/echo/distributionhistory/" + flash}>
                  <img alt="" src={HISTORY_WHITE} height="24" />
                  Distribution History
                </Link>
              </li>
              <li>
                <Link to={"/echo/audithistory/" + flash}>
                  <img alt="" src={HISTORY_WHITE} height="24" />
                  Audit History
                </Link>
              </li>
              {/* <li>
                <a href="#">
                  <img src={COMMENTS_WHITE} height="24" /> Comments
                </a>
              </li> */}
            </ul>
          </div>

          <div className="card mb-3">
            <div className="card-header font-weight-bold font-1rem">
              <h5>
                {this.props.close} Notification: {outage.flashNumber}
                <img alt="" src={ICON_ALERT_ORANGE} className="ml-1 img-top-2" height="20" />
                <span className="float-right font-weight-normal font-14">
                  Status : <span className="text-red font-weight-bold">{outage.flashStatus}</span>
                </span>
              </h5>
            </div>
            <div className="card-body font-14">
              <div className="row">
                <div className="col-12 col-sm-6 col-lg-3">
                  <p className="card-text mb-1">
                    <strong>Event Time Zone </strong>
                    {outage.networkEventTimeZone}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Outage Start </strong> {outage.outageStartDate && outageStartDate}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Outage Reported </strong> {outage.reportedDateTime && reportedDateTime}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Criteria Met </strong> {outage.criteriaMetDate && criteriaMetDate}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Special Services </strong> {outage.specialServices}
                  </p>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  {/* <p className="card-text mb-1">
                    <strong>FCC Reportable</strong> ????
                  </p> */}
                  <p className="card-text mb-1">
                    <strong>Outage Director </strong>
                    {outage.outageDirector}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Organization </strong>
                    {outage.reportingOrg}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Contact </strong>
                    {outage.contactName}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Severity Level </strong> {outage.severitylevel}
                  </p>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  {/* <p className="card-text mb-1">
                    <strong>Special Services </strong> ????
                  </p> */}
                  <p className="card-text mb-1">
                    <strong>Network </strong>
                    {outage.network}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Impact </strong>
                    {outage.impact}
                  </p>
                  <p className="card-text mb-1">
                    <strong>
                      Phone <img alt="" src={ICON_PHONE} height="18" className="mr-1 ml-1" />
                    </strong>
                    {outage.contactNumber}
                  </p>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                  <p className="card-text mb-1">
                    <strong>Criteria </strong>
                    {outage.outageCriteria}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Subnetwork </strong>
                    {outage.subnetwork}
                  </p>
                  <p className="card-text mb-1">
                    <strong>
                      Email <img alt="" src={ICON_EMAIL} height="18" className="mr-1 ml-1" />
                    </strong>
                    {outage.contactEmail}
                  </p>
                </div>
                <div className="col-12">
                  <p className="card-text mb-1">
                    <strong>Description </strong> {outage.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="accordion">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 bt-4 mt-1 pt-1">
                  <button
                    className="btn btn-link font-weight-bold no-padding full-width text-left"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseOne"
                  >
                    Location (s)
                    <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                    <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                  </button>
                </h5>
              </div>

              <div id="collapseOne" className="collapse show">
                <div className="card-body no-padding-top">
                  <table className="table no-border table-striped">
                    {this.state.locations ? (
                      <thead>
                        <tr>
                          <th scope="col">PB</th>
                          <th scope="col">Territory</th>
                          <th scope="col">Region</th>
                          <th scope="col">Sub Region</th>
                          <th scope="col">Code Type</th>
                          <th scope="col">Code</th>
                          <th scope="col">Address</th>
                          <th scope="col">City</th>
                          <th scope="col">State</th>
                          <th scope="col">Zip Code</th>
                          <th scope="col">County</th>
                          <th scope="col">Country</th>
                          {outage.severitylevel === "SPECIAL ALERT" &&
                            (outage.network === "MANMADE HAZARDS" || outage.network === "NATURAL HAZARDS") && (
                              <th scope="col">Stormcon</th>
                            )}
                        </tr>
                      </thead>
                    ) : (
                      ""
                    )}
                    <tbody className="font-14">
                      {this.state.locations ? (
                        this.state.locations.map(location => (
                          <tr key="location">
                            <td>{location.priorityBanding}</td>
                            <td>{location.territory}</td>
                            <td>{location.region}</td>
                            <td>{location.subRegion}</td>
                            <td>{location.locationCodeType}</td>
                            <td>{location.locationCode}</td>
                            <td>{location.street}</td>
                            <td>{location.city}</td>
                            <td>{location.state}</td>
                            <td>{location.zip}</td>
                            <td>{location.county}</td>
                            <td>{location.country}</td>

                            {outage.severitylevel === "SPECIAL ALERT" &&
                              (outage.network === "MANMADE HAZARDS" || outage.network === "NATURAL HAZARDS") && (
                                <td>
                                  {location.stormconLevel ? <td>{location.stormconLevel}</td> : <td> {"N/A"}</td>}
                                </td>
                              )}
                          </tr>
                        ))
                      ) : (
                        <div className="noitems">No Locations found</div>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {outage.severitylevel === "SPECIAL ALERT" &&
            (outage.network === "MANMADE HAZARDS" || outage.network === "NATURAL HAZARDS") &&
            this.state.sitrep ? (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 bt-4 mt-1 pt-1">
                    <button
                      className="btn btn-link font-weight-bold no-padding full-width text-left"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseOne"
                    >
                      Situation Report
                      <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                      <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                    </button>
                  </h5>
                </div>

                <div id="collapseOne" className="collapse show">
                  <div className="card-body card-body-150 no-padding-top">
                    <ViewSituationReport sitrep={this.state.sitrep} attachments={this.state.attachments} />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 bt-4 mt-1 pt-1">
                  <button
                    className="btn btn-link font-weight-bold no-padding full-width text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseTwo"
                  >
                    Equipment
                    <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                    <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                  </button>
                </h5>
              </div>
              <div id="collapseTwo" className="collapse">
                <div className="card-body no-padding-top">
                  {this.renderEquipmentPanel(equipments)}
                  {this.isEmpty(equipments) ? <div className="noitems">No Equipment data found</div> : ""}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 bt-4 mt-1 pt-1">
                  <button
                    className="btn btn-link font-weight-bold no-padding full-width text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseThree"
                  >
                    Traffic Affected
                    <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                    <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                  </button>
                </h5>
              </div>
              <div id="collapseThree" className="collapse">
                <div className="card-body no-padding-top">
                  {!(this.state.trafficAffected instanceof Array) ? (
                    <table className="table table-borderless table-striped">
                      <thead>
                        <tr>
                          <th scope="col">Traffic Type</th>
                          <th scope="col">Traffic Count</th>
                        </tr>
                      </thead>
                      {this.renderTrafficAffected(traffic)}
                    </table>
                  ) : (
                    <div className="noitems">No traffic affected data found</div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h5 className="mb-0 bt-4 mt-1 pt-1">
                  <button
                    className="btn btn-link font-weight-bold no-padding full-width text-left collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseFour"
                  >
                    Ticket (s)
                    <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                    <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                  </button>
                </h5>
              </div>
              <div id="collapseFour" className="collapse">
                <div className="card-body no-padding-top">
                  <table className="table no-border table-striped">
                    {this.state.internalTickets && this.state.internalTickets.length > 0 ? (
                      <thead>
                        <tr>
                          <th scope="col">Ticket #</th>
                          <th scope="col">Type</th>
                          <th scope="col">Ticket Source</th>
                        </tr>
                      </thead>
                    ) : (
                      ""
                    )}
                    <tbody className="font-14">
                      {this.state.internalTickets && this.state.internalTickets.length > 0
                        ? this.state.internalTickets.map((ticket, index) => (
                            <tr key={index}>
                              <td>{ticket.ticketNumber}</td>
                              <td>{ticket.ticketType}</td>
                              <td>{ticket.ticketSource}</td>
                            </tr>
                          ))
                        : ""}
                    </tbody>
                  </table>
                  {this.state.tickets ? "" : <div className="noitems">No Tickets found</div>}
                </div>
              </div>
              <div id="collapseFour" className="collapse">
                <div className="card-body no-padding-top">
                  <table className="table no-border table-striped">
                    {this.state.externalTickets && this.state.externalTickets.length > 0 ? (
                      <thead>
                        <tr>
                          <th scope="col">Ticket #</th>
                          <th scope="col">Type</th>
                          <th scope="col">LEC/OCC</th>
                          <th scope="col">Contact</th>
                        </tr>
                      </thead>
                    ) : (
                      ""
                    )}
                    <tbody className="font-14">
                      {this.state.externalTickets && this.state.externalTickets.length > 0
                        ? this.state.externalTickets.map((ticket, index) => (
                            <tr key={index}>
                              <td>{ticket.ticketNumber}</td>
                              <td>{ticket.ticketType}</td>
                              <td>{ticket.lec_occ}</td>
                              <td>{ticket.contactNumber}</td>
                            </tr>
                          ))
                        : ""}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {outage.flashStatus === "Final Verified" ? (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 bt-4 mt-1 pt-1">
                    <button
                      className="btn btn-link font-weight-bold no-padding full-width text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseFive"
                    >
                      Closure Details
                      <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                      <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                    </button>
                  </h5>
                </div>
                <div id="collapseFive" className="collapse closurepadding">
                  <div className="card-body no-padding-top no-padding-left font-14">
                    <div className="row closure">
                      <div className="col-12 col-sm-6 col-lg-3 no-padding-left">
                        <p className="card-text mb-1">
                          <strong>Outage End Date </strong> {outage.outageEndDate && outageEndDate}
                        </p>
                        <p className="card-text mb-1">
                          <strong>Resolution </strong> {outage.correctiveActionTaken}
                        </p>
                        <p className="card-text mb-1">
                          <strong>Storm Name </strong> {outage.stormName}
                        </p>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-4">
                        <p className="card-text mb-1">
                          <strong>Primary Cause of Outage </strong> {outage.causeOfOutage}
                        </p>
                        <p className="card-text mb-1">
                          <strong>Secondary Cause of Outage </strong> {outage.secondaryCauseOfOutages}
                        </p>
                        <p className="card-text mb-1">
                          <strong>Method of Detection </strong> {outage.methodOfDetection}
                        </p>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-4">
                        <p className="card-text mb-1">
                          <strong>Metrics Exclusion </strong> {outage.metricsExclusion === "N" ? "No" : "Yes"}
                        </p>
                        <p className="card-text mb-1">
                          <strong>Count Final Severity Level Only </strong>{" "}
                          {outage.finalSeverity === "N" ? "No" : "Yes"}
                        </p>
                        <p className="card-text mb-1">
                          <strong>Maintenance Related </strong> {outage.maintenanceRelated === "N" ? "No" : "Yes"}
                        </p>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-4">
                        <p className="card-text mb-1">
                          <strong>Maintenance# </strong> {outage.maintenanceNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {outage.flashStatus === "Final Verified" ? (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 bt-4 mt-1 pt-1">
                    <button
                      className="btn btn-link font-weight-bold no-padding full-width text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseFive"
                    >
                      Additional Details
                      <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                      <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                    </button>
                  </h5>
                </div>
                <div id="collapseFive" className="collapse closurepadding">
                  <div className="card-body no-padding-top no-padding-left font-14">
                    <div className="row closure">
                      <div className="col-12 col-sm-6 col-lg-3 no-padding-left">
                        <p className="card-text mb-1">
                          <strong>Outage End Date </strong> {outage.outageEndDate && outageEndDate}
                        </p>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-4">
                        <p className="card-text mb-1">
                          <strong>Outage Closed Date </strong> {outage.outageClosedDate && outageClosedDate}
                        </p>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-4">
                        <p className="card-text mb-1">
                          <strong>FCC Report Met </strong> {outage.fccReportMet && fccReportMet}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {this.props.close !== "Close" ? (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 bt-4 mt-1 pt-1">
                    <button
                      className="btn btn-link font-weight-bold no-padding full-width text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseSix"
                    >
                      Comment (s)
                      <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                      <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                    </button>
                  </h5>
                </div>
                <div id="collapseSix" className="collapse">
                  <div className="card-body no-padding-top">
                    <table className="table no-border table-striped">
                      {this.state.comments ? (
                        <thead>
                          <tr>
                            <th scope="col">Comment</th>
                            <th scope="col">Date</th>
                          </tr>
                        </thead>
                      ) : (
                        ""
                      )}
                      <tbody className="font-14">
                        {this.state.comments ? (
                          this.state.comments.map((comment, index) => (
                            <tr key={index}>
                              <td>{comment.comment}</td>
                              <td>
                                {dateConversationViewSave(
                                  "GMT",
                                  this.state.networkEventTimeZoneJavaId,
                                  comment.createdDateTime,
                                  "YYYY-MM-DD HH:mm:ss"
                                )}
                                ({this.state.outageView.networkEventTimeZone})
                              </td>
                            </tr>
                          ))
                        ) : (
                          <div className="noitems">No Comments found</div>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {outage.severitylevel === "SPECIAL ALERT" &&
            (outage.network === "MANMADE HAZARDS" || outage.network === "NATURAL HAZARDS") ? (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0 bt-4 mt-1 pt-1">
                    <button
                      className="btn btn-link font-weight-bold no-padding full-width text-left collapsed"
                      type="button"
                      data-toggle="collapse"
                      data-target="#collapseSeven"
                    >
                      Images
                      <img alt="" src={ICON_PLUS_SMALL} className="float-right mt-1 plus-ac" height="14" />
                      <img alt="" src={ICON_MINUS_SMALL} className="float-right mt-1 minus-ac" height="14" />
                    </button>
                  </h5>
                </div>
                <div id="collapseSeven" className="collapse">
                  <div className="card-body no-padding-top">
                    <ImageUploadView images={this.state.images} />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  }
}

Notification.propTypes = {
  handleloading: PropTypes.func,
  onClickMyNotification: PropTypes.func,
  flash: PropTypes.object,
  show: PropTypes.string,
  close: PropTypes.string
};

export default Notification;

/* const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClickMyNotification() {
      const notificationTab = {
        name: `Notification ${ownProps.flash.flash}`,
        description: "",
        isCurrent: true,
        routeUrl: `/echo/view/${ownProps.flash.flash}`
      };
      dispatch({ type: ADD_TABSTRIP, payload: notificationTab });
    }
  };
};

export default connect(
  null,
  mapDispatchToProps
)(Notification); */
