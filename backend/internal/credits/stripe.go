package credits

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/checkout/session"
	"github.com/stripe/stripe-go/v81/webhook"
)

type CreditPack struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Credits  int    `json:"credits"`
	PriceID  string `json:"price_id"`
	PriceCents int  `json:"price_cents"`
}

var CreditPacks = []CreditPack{
	{ID: "starter", Name: "Starter Pack", Credits: 50, PriceCents: 999},
	{ID: "pro", Name: "Pro Pack", Credits: 200, PriceCents: 2999},
	{ID: "enterprise", Name: "Enterprise Pack", Credits: 1000, PriceCents: 9999},
}

type StripeIntegration struct {
	secretKey     string
	webhookSecret string
	manager       *Manager
	successURL    string
	cancelURL     string
}

func NewStripeIntegration(secretKey, webhookSecret string, manager *Manager, baseURL string) *StripeIntegration {
	if secretKey != "" {
		stripe.Key = secretKey
	}
	return &StripeIntegration{
		secretKey:     secretKey,
		webhookSecret: webhookSecret,
		manager:       manager,
		successURL:    baseURL + "/credits/success",
		cancelURL:     baseURL + "/credits/cancel",
	}
}

func (s *StripeIntegration) CreateCheckoutSession(userID, packID string) (string, error) {
	if s.secretKey == "" {
		return "", fmt.Errorf("stripe not configured")
	}

	var pack *CreditPack
	for _, p := range CreditPacks {
		if p.ID == packID {
			pack = &p
			break
		}
	}
	if pack == nil {
		return "", fmt.Errorf("unknown credit pack: %s", packID)
	}

	params := &stripe.CheckoutSessionParams{
		Mode: stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("usd"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name:        stripe.String(pack.Name),
						Description: stripe.String(fmt.Sprintf("%d scan credits", pack.Credits)),
					},
					UnitAmount: stripe.Int64(int64(pack.PriceCents)),
				},
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(s.successURL + "?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(s.cancelURL),
		Metadata: map[string]string{
			"user_id":  userID,
			"pack_id":  packID,
			"credits":  fmt.Sprintf("%d", pack.Credits),
		},
	}

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("stripe session: %w", err)
	}

	return sess.URL, nil
}

func (s *StripeIntegration) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	if s.secretKey == "" {
		http.Error(w, "stripe not configured", http.StatusServiceUnavailable)
		return
	}

	body, err := io.ReadAll(io.LimitReader(r.Body, 65536))
	if err != nil {
		http.Error(w, "read error", http.StatusBadRequest)
		return
	}

	event, err := webhook.ConstructEvent(body, r.Header.Get("Stripe-Signature"), s.webhookSecret)
	if err != nil {
		http.Error(w, "invalid signature", http.StatusBadRequest)
		return
	}

	if event.Type == "checkout.session.completed" {
		var sess stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
			http.Error(w, "parse error", http.StatusBadRequest)
			return
		}

		userID := sess.Metadata["user_id"]
		credits := 0
		fmt.Sscanf(sess.Metadata["credits"], "%d", &credits)

		if userID != "" && credits > 0 {
			s.manager.AddCredits(userID, credits)
			log.Printf("credits: added %d credits for user %s", credits, userID)
		}
	}

	w.WriteHeader(http.StatusOK)
}
