import styled from "@emotion/styled";

import IconButtonWrapper from "metabase/components/IconButtonWrapper";
import { Ellipsified } from "metabase/core/components/Ellipsified";
import { color } from "metabase/lib/colors";
import { FixedSizeIcon } from "metabase/ui";

export const BannerCloseButton = styled(IconButtonWrapper)`
  color: ${color("text-light")};
  margin-inline-start: auto;
`;

export const BannerModelIcon = styled(FixedSizeIcon)`
  color: ${color("text-dark")};
  margin-inline-end: 0.5rem;
`;

export const MultilineEllipsified = styled(Ellipsified)`
  white-space: pre-line;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  // Without the following rule, the useIsTruncated hook,
  // which Ellipsified calls, might think that this element
  // is truncated when it is not
  padding-bottom: 1px;
`;
