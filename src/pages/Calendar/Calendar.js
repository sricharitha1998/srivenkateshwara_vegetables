import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { isEmpty } from "lodash";

import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Container,
} from "reactstrap";

import { useForm, Controller } from "react-hook-form";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import BootstrapTheme from "@fullcalendar/bootstrap";
//css
// import "@fullcalendar/bootstrap/main.css"

//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import {
  getEvents,
  addNewEvent,
  updateEvent,
  deleteEvent,
  getCategories,
} from "../../store/actions";
import DeleteModal from "./DeleteModal";

const FormWrapper = ({ onSubmit, children }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { control, errors })
      )}
    </form>
  );
};

class Calender extends Component {
  constructor(props) {
    super(props);
    this.handleDateClick = this.handleDateClick.bind(this);
    this.calendarComponentRef = React.createRef();

    this.state = {
      breadcrumbItems: [
        { title: "Nazox", link: "/" },
        { title: "Calendar", link: "#" },
      ],
      calendarWeekends: true,
      modal: false,
      modalcategory: false,
      isDragBind: false,
      deleteModal: false,
      event: {},
    };

    this.toggle = this.toggle.bind(this);
    this.togglecategory = this.togglecategory.bind(this);
    this.handleValidEventSubmit = this.handleValidEventSubmit.bind(this);
    this.handleValidEventSubmitcategory =
      this.handleValidEventSubmitcategory.bind(this);

    // category
    this.onDrag = this.onDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  componentDidMount = () => {
    const { onGetCategories, onGetEvents } = this.props;
    onGetCategories();
    onGetEvents();
    new Draggable(document.getElementById("external-events"), {
      itemSelector: ".external-event",
    });
  };

  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { event, modal } = this.state;
    if (prevState.modal !== modal && !modal && !isEmpty(event)) {
      setTimeout(() => {
        this.setState({ event: {}, isEdit: false });
      }, 500);
    }
  }

  /**
   * Handling the modal state
   */
  toggle() {
    this.setState((prevState) => ({
      modal: !prevState.modal,
    }));
  }

  togglecategory() {
    this.setState((prevState) => ({
      modalcategory: !prevState.modalcategory,
    }));
  }

  /**
   * Handling date click on calendar
   */
  handleDateClick = (arg) => {
    const date = arg["date"];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const currectDate = new Date();
    const currentHour = currectDate.getHours();
    const currentMin = currectDate.getMinutes();
    const currentSec = currectDate.getSeconds();
    const modifiedDate = new Date(
      year,
      month,
      day,
      currentHour,
      currentMin,
      currentSec
    );
    const modifiedData = { ...arg, date: modifiedDate };

    this.setState({ selectedDay: modifiedData });
    this.toggle();
  };

  /**
   * Handling click on event on calendar
   */
  handleEventClick = (arg) => {
    const event = arg.event;
    this.setState({
      event: {
        id: event.id,
        title: event.title,
        title_category: event.title_category,
        start: event.start,
        className: event.classNames,
        category: event.classNames[0],
        event_category: event.classNames[0],
      },
      isEdit: true,
    });
    this.toggle();
  };

  /**
   * Handling submit event on event form
   */
  handleValidEventSubmit = (e, values) => {
    const { onAddNewEvent, onUpdateEvent } = this.props;
    const { isEdit, event, selectedDay } = this.state;
    if (isEdit) {
      const updateEvent = {
        id: event.id,
        title: values.title,
        classNames: values.category + " text-white",
        start: event.start,
      };
      // update event
      onUpdateEvent(updateEvent);
    } else {
      const newEvent = {
        id: Math.floor(Math.random() * 100),
        title: values["title"],
        start: selectedDay ? selectedDay.date : new Date(),
        className: values.category + " text-white",
      };
      // save new event
      onAddNewEvent(newEvent);
    }

    this.setState({ selectedDay: null });
    this.toggle();
  };

  handleValidEventSubmitcategory = (event, values) => {
    const { onAddNewEvent } = this.props;

    const newEvent = {
      id: Math.floor(Math.random() * 100),
      title: values["title_category"],
      start: new Date(),
      className: values.event_category
        ? values.event_category + " text-white"
        : "bg-danger text-white",
    };
    // save new event
    onAddNewEvent(newEvent);
    this.togglecategory();
  };

  /**
   * On delete event
   */
  handleDeleteEvent = () => {
    const { onDeleteEvent } = this.props;
    const { event } = this.state;

    onDeleteEvent(event);
    this.setState({ deleteModal: false });
    this.toggle();
  };

  /**
   * On category darg event
   */
  onDrag = (event) => {
    event.preventDefault();
  };

  /**
   * On calendar drop event
   */
  onDrop = (event) => {
    const date = event["date"];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const currectDate = new Date();
    const currentHour = currectDate.getHours();
    const currentMin = currectDate.getMinutes();
    const currentSec = currectDate.getSeconds();
    const modifiedDate = new Date(
      year,
      month,
      day,
      currentHour,
      currentMin,
      currentSec
    );

    const { onAddNewEvent } = this.props;
    const draggedEl = event.draggedEl;
    const modifiedData = {
      id: Math.floor(Math.random() * 100),
      title: draggedEl.innerText,
      start: modifiedDate,
      className: draggedEl.className,
    };
    onAddNewEvent(modifiedData);
  };

  render() {
    const { events, categories } = this.props;
    const { isEdit, deleteModal } = this.state;

    return (
      <React.Fragment>
        <DeleteModal
          show={deleteModal}
          onDeleteClick={this.handleDeleteEvent}
          onCloseClick={() => this.setState({ deleteModal: false })}
        />
        <div className="page-content">
          <Container fluid={true}>
            {/* Render Breadcrumb */}
            <Breadcrumbs
              title="Calendar"
              breadcrumbItems={this.state.breadcrumbItems}
            />
            <Row className="mb-4">
              <Col xl={3}>
                <Card className="h-100">
                  <CardBody>
                    <Button
                      color="primary"
                      className="btn font-16 btn-primary waves-effect waves-light w-100"
                      onClick={this.togglecategory}
                    >
                      Create New Event
                    </Button>

                    <div id="external-events" className="mt-4">
                      <p className="text-muted">
                        Drag and drop your event or click in the calendar
                      </p>
                      {categories &&
                        categories.map((category, i) => (
                          <div
                            key={i}
                            className={`${category.type} external-event fc-event text-white`}
                            draggable
                            onDrag={(event) => this.onDrag(event, category)}
                          >
                            <i className="mdi mdi-checkbox-blank-circle font-size-11 me-2" />
                            {category.title}
                          </div>
                        ))}
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col xl={9}>
                <Card className="mb-0">
                  <CardBody>
                    {/* fullcalendar control */}
                    <FullCalendar
                      ref={this.calendarComponentRef}
                      plugins={[
                        BootstrapTheme,
                        dayGridPlugin,
                        interactionPlugin,
                      ]}
                      headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,dayGridWeek,dayGridDay",
                      }}
                      slotDuration={"00:15:00"}
                      handleWindowResize={true}
                      themeSystem="bootstrap"
                      events={events}
                      editable={true}
                      droppable={true}
                      selectable={true}
                      dateClick={this.handleDateClick}
                      eventClick={this.handleEventClick}
                      drop={this.onDrop}
                    />

                    {/* New/Edit event modal */}
                    <Modal
                      isOpen={this.state.modal}
                      className={this.props.className}
                      id="event-modal"
                    >
                      <ModalHeader toggle={this.toggle} tag="h4">
                        {!!isEdit ? "Edit Event" : "Add Event"}
                      </ModalHeader>
                      <ModalBody>
                        <form onSubmit={this.handleValidEventSubmit}>
                          <Row form>
                            <Col className="col-12 mb-3">
                              <label>Event Name</label>
                              <FormWrapper onSubmit={this.handleSubmit}>
                                <Controller
                                  name="title"
                                //   control={control}
                                  rules={{ required: "Event name is required" }}
                                  defaultValue={
                                    this.state.event
                                      ? this.state.event.title
                                      : ""
                                  }
                                  render={({ field }) => (
                                    <input
                                      {...field}
                                      type="text"
                                      className={`form-control ${
                                        this.state.event.title ? "is-invalid" : ""
                                      }`}
                                      placeholder="Event Name"
                                    />
                                  )}
                                />
                              </FormWrapper>
                              {/* <AvField
                                                                name="title"
                                                                label="Event Name"
                                                                placeholder='Event Name'
                                                                type="text"
                                                                errorMessage="Invalid name"
                                                                validate={{
                                                                    required: { value: true },
                                                                }}
                                                                value={
                                                                    this.state.event
                                                                        ? this.state.event.title
                                                                        : ""
                                                                }
                                                            /> */}
                            </Col>
                            <Col className="col-12 mb-3">
                              <label>Select Category</label>
                              <FormWrapper onSubmit={this.handleSubmit}>
                                <Controller
                                  name="category"
                                //   control={control}
                                  defaultValue={
                                    this.state.event
                                      ? this.state.event.category
                                      : "bg-primary"
                                  }
                                  render={({ field }) => (
                                    <select
                                      {...field}
                                      className="form-control"
                                      onChange={(e) => {
                                        field.onChange(e);
                                        // handleCategoryChange(e);
                                      }}
                                    >
                                      <option value="bg-danger">Danger</option>
                                      <option value="bg-success">
                                        Success
                                      </option>
                                      <option value="bg-primary">
                                        Primary
                                      </option>
                                      <option value="bg-info">Info</option>
                                      <option value="bg-dark">Dark</option>
                                      <option value="bg-warning">
                                        Warning
                                      </option>
                                    </select>
                                  )}
                                />
                              </FormWrapper>
                              {/* <AvField
                                                                type="select"
                                                                name="category"
                                                                label="Select Category"
                                                                value={
                                                                    this.state.event
                                                                        ? this.state.event.category
                                                                        : "bg-primary"
                                                                }
                                                            >
                                                                <option value="bg-danger">Danger</option>
                                                                <option value="bg-success">Success</option>
                                                                <option value="bg-primary">Primary</option>
                                                                <option value="bg-info">Info</option>
                                                                <option value="bg-dark">Dark</option>
                                                                <option value="bg-warning">Warning</option>
                                                            </AvField> */}
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <div className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-light me-2"
                                  onClick={this.toggle}
                                >
                                  Close
                                </button>
                                {!!isEdit && (
                                  <button
                                    type="button"
                                    className="btn btn-danger me-2"
                                    onClick={() =>
                                      this.setState({ deleteModal: true })
                                    }
                                  >
                                    Delete
                                  </button>
                                )}
                                <button
                                  type="submit"
                                  className="btn btn-success save-event"
                                >
                                  Save
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </form>
                      </ModalBody>
                    </Modal>

                    <Modal
                      isOpen={this.state.modalcategory}
                      toggle={this.togglecategory}
                      className={this.props.className}
                    >
                      <ModalHeader toggle={this.togglecategory} tag="h4">
                        Add a category
                      </ModalHeader>
                      <ModalBody>
                        <form onSubmit={this.handleValidEventSubmitcategory}>
                          <Row form>
                            <Col className="col-12">
                              <div className="mb-3">
                                <label>Category Name</label>
                                <FormWrapper onSubmit={this.handleSubmit}>
                                  <Controller
                                    name="title_category"
                                    // control={control}
                                    rules={{
                                      required: "Category name is required",
                                    }}
                                    defaultValue={this.state.title_category}
                                    render={({ field }) => (
                                      <input
                                        {...field}
                                        type="text"
                                        className={`form-control ${
                                            this.state.title_category
                                            ? "is-invalid"
                                            : ""
                                        }`}
                                        placeholder="Category Name"
                                      />
                                    )}
                                  />
                                </FormWrapper>
                              </div>
                            </Col>
                            <Col className="col-12">
                              <div className="mb-3">
                                <label>Choose Category Color</label>
                                <FormWrapper onSubmit={this.handleSubmit}>
                                  <Controller
                                    name="event_category"
                                    // control={control}
                                    defaultValue={this.state.event_category}
                                    render={({ field }) => (
                                      <select
                                        {...field}
                                        className="form-control"
                                      >
                                        <option value="bg-danger">
                                          Danger
                                        </option>
                                        <option value="bg-success">
                                          Success
                                        </option>
                                        <option value="bg-primary">
                                          Primary
                                        </option>
                                        <option value="bg-info">Info</option>
                                        <option value="bg-dark">Dark</option>
                                        <option value="bg-warning">
                                          Warning
                                        </option>
                                      </select>
                                    )}
                                  />
                                </FormWrapper>
                              </div>
                            </Col>
                          </Row>
                          <Row>
                            <Col>
                              <div className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-light me-2"
                                  onClick={this.togglecategory}
                                >
                                  Close
                                </button>
                                <button
                                  type="submit"
                                  className="btn btn-success save-event"
                                >
                                  Save
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </form>
                      </ModalBody>
                    </Modal>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

Calender.propTypes = {
  categories: PropTypes.array,
  className: PropTypes.string,
  events: PropTypes.array,
  onAddNewEvent: PropTypes.func,
  onDeleteEvent: PropTypes.func,
  onGetCategories: PropTypes.func,
  onGetEvents: PropTypes.func,
  onUpdateEvent: PropTypes.func,
};

const mapStateToProps = ({ Calendar }) => ({
  events: Calendar.events,
  categories: Calendar.categories,
});

const mapDispatchToProps = (dispatch) => ({
  onGetEvents: () => dispatch(getEvents()),
  onGetCategories: () => dispatch(getCategories()),
  onAddNewEvent: (event) => dispatch(addNewEvent(event)),
  onUpdateEvent: (event) => dispatch(updateEvent(event)),
  onDeleteEvent: (event) => dispatch(deleteEvent(event)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Calender);
