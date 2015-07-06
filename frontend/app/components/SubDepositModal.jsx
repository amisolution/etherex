var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

var ConfirmModal = require('./ConfirmModal');

var utils = require("../js/utils");

var SubDepositModal = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      amount: this.props.amount ? utils.numeral(this.props.amount, 4) : 0,
      newDeposit: false,
      isModalOpen: false,
      showConfirmModal: false,
      showDefaultAmount: true
    };
  },

  componentDidMount: function() {
    this.validate(new Event('validate'));
  },

  onHide: function(e) {
    e.preventDefault();
    this.setState({ showDefaultAmount: true });
    this.props.onHide();
  },

  openConfirmModal: function() {
    this.props.onHide();
    this.setState({ showConfirmModal: true });
  },

  closeConfirmModal: function() {
    this.setState({ showConfirmModal: false });
  },

  render: function() {
    return (
      <div>
        <Modal {...this.props} animation={true} enforceFocus={false}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modalTitle}</Modal.Title>
          </Modal.Header>
          <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
            <Modal.Body>
                  <label forHtml="amount">Amount</label>
                  <input type="number" min="0.0001" step="0.00000001" className="form-control" placeholder="10.0000" ref="amount"
                         onChange={this.handleChange} value={this.state.showDefaultAmount ? this.props.amount : this.state.amount} />
            </Modal.Body>
            <Modal.Footer>
                <Button className={"btn-block" + (this.state.newDeposit ? " btn-primary" : "")} type="submit" key="deposit">Deposit</Button>
            </Modal.Footer>
          </form>
        </Modal>
        <ConfirmModal
          show={this.state.showConfirmModal}
          onHide={this.closeConfirmModal}
          message={<FormattedMessage message={this.getIntlMessage('deposit.confirm')}
                                            amount={this.state.amount}
                                            currency={this.props.market.name} />}
          flux={this.props.flux}
          onSubmit={this.onSubmitForm}
        />
      </div>
    );
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e) {
    e.preventDefault();
    if (this.validate(e, true))
      this.openConfirmModal();
  },

  validate: function(e, showAlerts) {
    e.preventDefault();
    e.stopPropagation();

    var amount = this.refs.amount ? parseFloat(this.refs.amount.getDOMNode().value.trim()) : 0;

    this.setState({
      amount: amount,
      showDefaultAmount: false
    });

    if (!amount)
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    else if (amount > this.props.user.balance_sub)
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('deposit.not_enough'), {
                                        currency: this.props.market.name,
                                        balance: this.props.user.balance_sub,
                                        amount: amount
                                      }));
    else {
      this.setState({
        newDeposit: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newDeposit: false
    });

    if (showAlerts) {
      this.props.showAlert(true);
      this.props.onHide();
    }

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el)) {
      this.props.onHide();
      return false;
    }

    this.props.flux.actions.user.depositSub({
      amount: this.state.amount
    });

    this.refs.amount.getDOMNode().value = '';

    this.setState({
      amount: null,
      newDeposit: false
    });

    this.props.onHide();
  }
});

module.exports = SubDepositModal;