import { useLocation } from "react-router-dom";
import {trackPageView } from "./analytics.ts";
import { useEffect } from "react";

// Component to track page views
export function PageTracker() {
    const location = useLocation();

    useEffect(() => {
        trackPageView(location.pathname);
    }, [location]);

    return null;
}
