<section class="hsc-lead-module">
  <h2>{{ module.form_heading }}</h2>

  <form id="hsc-lead-form">
    <input type="text" id="firstname" name="firstname" placeholder="First Name" required />
    <input type="text" id="lastname" name="lastname" placeholder="Last Name" required />
    <input type="email" id="email" name="email" placeholder="Email" required />
    <input type="tel" id="phone" name="phone" placeholder="Phone" required />
    <input type="text" id="address" name="address" placeholder="Street Address" required />
    <button type="submit">{{ module.button_text }}</button>
  </form>
</section>

<script>
(function() {
  const utmKeys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"];
  
  // Store UTM parameters
  const urlParams = new URLSearchParams(window.location.search);
  utmKeys.forEach(key => {
    const value = urlParams.get(key);
    if(value) localStorage.setItem(key, value);
  });

  // Load Google Maps asynchronously
  function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
      if(window.google && google.maps && google.maps.places) return resolve();

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
      script.async = true;
      script.defer = true;
      window.initAutocomplete = resolve; // callback when script loads
      script.onerror = reject;

      document.head.appendChild(script);
    });
  }

  document.addEventListener("DOMContentLoaded", async function() {
    const form = document.getElementById("hsc-lead-form");
    const addressInput = document.getElementById("address");

    // Initialize Google Places autocomplete
    try {
      await loadGoogleMaps("{{ module.google_api_key }}");
      const autocomplete = new google.maps.places.Autocomplete(addressInput, { types: ["address"] });
      autocomplete.addListener("place_changed", function() {
        const place = autocomplete.getPlace();
        if(place && place.formatted_address) addressInput.value = place.formatted_address;
      });
    } catch(err) {
      console.error("Google Maps failed to load:", err);
    }

    // Handle form submission
    form.addEventListener("submit", async function(e) {
      e.preventDefault();

      const data = {
        firstname: document.getElementById("firstname").value.trim(),
        lastname: document.getElementById("lastname").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim(),
        pageUri: window.location.href
      };

      utmKeys.forEach(key => {
        data[key] = localStorage.getItem(key) || "";
      });

      try {
        const res = await fetch("https://hubspotgate.netlify.app/.netlify/functions/submit-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if(res.ok) {
          localStorage.setItem("lead_email", data.email);
          localStorage.setItem("lead_address", data.address);
          window.location.href = "{{ module.redirect_url }}";
        } else {
          const text = await res.text();
          console.error("Submission failed:", text);
          alert("Submission failed, please try again.");
        }

      } catch(err) {
        console.error("Submission error:", err);
        alert("Submission error, please try again.");
      }
    });

  });

})();
</script>
