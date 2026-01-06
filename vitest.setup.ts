import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
    useSearchParams: () => ({
        get: vi.fn().mockReturnValue(null),
    }),
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    usePathname: () => "/app",
}));

// Mock Convex
vi.mock("convex/react", () => ({
    useQuery: vi.fn().mockReturnValue(undefined),
    useMutation: vi.fn().mockReturnValue(vi.fn()),
    useAction: vi.fn().mockReturnValue(vi.fn()),
}));
