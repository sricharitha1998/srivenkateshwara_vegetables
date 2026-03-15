import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  Input,
  TabPane,
} from "reactstrap";
import classnames from "classnames";

// Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

// Import actions
import { getProductDetail } from "../../store/actions";

const ProductDetail = ({ match, product, onGetProductDetail }) => {
  const [activeTab, setActiveTab] = useState("1");
  const [activeDescriptionTab, setActiveDescriptionTab] = useState("description");
  const [breadcrumbItems] = useState([
    { title: "Ecommerce", link: "#" },
    { title: "Product Detail", link: "#" },
  ]);

  useEffect(() => {
    if (match && match.params && match.params.id) {
      onGetProductDetail(match.params.id);
    }
  }, [match, onGetProductDetail]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const toggledescription = (tab) => {
    if (activeDescriptionTab !== tab) {
      setActiveDescriptionTab(tab);
    }
  };

  const [imageBlobs, setImageBlobs] = useState([]);

useEffect(() => {
  if (match?.params?.id) {
    onGetProductDetail(match.params.id);
  }
}, [match, onGetProductDetail]);
console.log("imageBlobs", imageBlobs)
useEffect(() => {
  const fetchImages = async () => {
    if (product?.images?.length > 0) {
      const fetchedImages = await Promise.all(
        product.images.map(async (imgObj) => {
          try {
            const res = await fetch(imgObj.secure_url, {
              credentials: "include", // if cookies/session required
              // headers: {
              //   Authorization: `Bearer ${token}` // optional: if auth token is needed
              // }
            });

            const blob = await res.blob();
            return {
              ...imgObj,
              localUrl: URL.createObjectURL(blob),
            };
          } catch (err) {
            console.error("Error fetching image:", err);
            return { ...imgObj, localUrl: null };
          }
        })
      );
      setImageBlobs(fetchedImages);
    }
  };

  fetchImages();
}, [product?.images]);


  const imageShow = (img, id) => {
    const expandImg = document.getElementById("expandedImg" + id);
    expandImg.src = img;
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumbs title="Product Detail" breadcrumbItems={breadcrumbItems} />

        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <Row>
                  <Col xl="5">
                    <div className="product-detail">
                      <Row>
                        <Col xs="3">
                        <Nav className="flex-column" pills>
  {imageBlobs?.map((image, index) => (
    <NavItem key={index}>
      <NavLink
        className={classnames({ active: activeTab === `${index + 1}` })}
        onClick={() => toggleTab(`${index + 1}`)}
      >
        <img
          src={image.localUrl}
          alt={image.alt_text || ""}
          onClick={() => imageShow(image.localUrl, index + 1)}
          className="img-fluid mx-auto d-block tab-img rounded"
        />
      </NavLink>
    </NavItem>
  ))}
</Nav>

                        </Col>
                        <Col xs="9">
                        <TabContent activeTab={activeTab} className="position-relative">
  {imageBlobs?.map((image, index) => (
    <TabPane tabId={`${index + 1}`} key={index}>
      <div className="product-img">
        <img
          src={image.localUrl}
          alt={image.alt_text || ""}
          id={`expandedImg${index + 1}`}
          className="img-fluid mx-auto d-block"
        />
      </div>
    </TabPane>
  ))}
</TabContent>

                          <Row className="text-center mt-2">
                            <div className="col-sm-6">
                              <div className="d-grid">
                                <Button
                                  type="button"
                                  color="primary"
                                  className="btn-block waves-effect waves-light mt-2 me-1"
                                >
                                  <i className="uil uil-shopping-cart-alt me-2"></i> Add to cart
                                </Button>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="d-grid">
                                <Button
                                  type="button"
                                  color="light"
                                  className="btn-block waves-effect mt-2 waves-light"
                                >
                                  <i className="uil uil-shopping-basket me-2"></i> Buy now
                                </Button>
                              </div>
                            </div>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                  </Col>

                  <Col xl="7">
                    <div className="mt-4 mt-xl-3">
                      <Link to="#" className="text-primary">
                        {product.category}
                      </Link>
                      <h5 className="mt-1 mb-3">{product.name}</h5>

                      <div className="d-inline-flex">
                        <div className="text-muted me-3">
                          {/* <StarRatings
                            rating={product.rating || 4}
                            starRatedColor="#F1B44C"
                            starEmptyColor="#2D363F"
                            numberOfStars={5}
                            name="rating"
                            starDimension="14px"
                            starSpacing="3px"
                          /> */}
                        </div>
                        <div className="text-muted">
                          ({product.reviews || 0})
                        </div>
                      </div>

                      <h5 className="mt-2">
                        <del className="text-muted me-2">${product.oldprice}</del>
                        ${product.newprice}
                        {!!product.isOffer && (
                          <span className="text-danger font-size-12 ms-2">
                            {product.offer}% Off
                          </span>
                        )}
                      </h5>

                      <p className="mt-3">{product.description}</p>

                      <hr className="my-4" />

                      <Row>
                        <Col md="6">
                          <div>
                            <h5 className="font-size-14">
                              <i className="mdi mdi-location"></i> Delivery location
                            </h5>
                            <div className="d-flex flex-wrap">
                              <div className="input-group mb-3 w-auto">
                                <Input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Delivery pincode"
                                />
                                <button className="btn btn-light" type="button">
                                  Check
                                </button>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

ProductDetail.propTypes = {
  product: PropTypes.object,
  match: PropTypes.object,
  onGetProductDetail: PropTypes.func.isRequired,
};

const mapStateToProps = ({ Ecommerce }) => ({
  product: Ecommerce.product,
});

const mapDispatchToProps = (dispatch) => ({
  onGetProductDetail: (id) => dispatch(getProductDetail(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductDetail);
